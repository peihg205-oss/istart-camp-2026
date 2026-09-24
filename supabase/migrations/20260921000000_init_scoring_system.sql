-- ==============================================================================
-- IStart Camp 2026 Team Scoring System
-- "Unlock the iSER in you"
-- Production Supabase PostgreSQL Architecture Migration
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 0. EXTENSIONS & SCHEMA CLEANUP
-- ------------------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ------------------------------------------------------------------------------
-- 1. PROFILES TABLE
-- Extends Supabase auth.users with RBAC roles (ADMIN, SCORER)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'SCORER' CHECK (role IN ('ADMIN', 'SCORER')),
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 2. TEAMS TABLE
-- Exactly 14 participating teams
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL CHECK (code ~ '^[A-Z0-9_-]+$'),
  name TEXT NOT NULL,
  motto TEXT,
  avatar_url TEXT,
  color_accent TEXT NOT NULL DEFAULT '#0284c7',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 3. ACTIVITIES TABLE
-- Challenge definitions and repeatability rules
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL CHECK (code ~ '^[A-Z0-9_]+$'),
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('ACADEMIC', 'CHALLENGE', 'DISCIPLINE', 'SPIRIT', 'SPECIAL')),
  description TEXT,
  rule_type TEXT NOT NULL CHECK (rule_type IN ('FIXED', 'RANKING', 'QUANTITY', 'FORMULA')),
  is_repeatable BOOLEAN NOT NULL DEFAULT FALSE,
  display_order INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 4. SCORING RULES TABLE
-- Configurations for calculation engines
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.scoring_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  activity_id UUID NOT NULL REFERENCES public.activities(id) ON DELETE CASCADE,
  rule_type TEXT NOT NULL CHECK (rule_type IN ('FIXED', 'RANKING', 'QUANTITY', 'FORMULA')),
  config JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_scoring_rules_activity UNIQUE (activity_id)
);

-- ------------------------------------------------------------------------------
-- 5. SCORE TRANSACTIONS TABLE
-- Immutable transaction ledger: Total score is NEVER directly overwritten
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.score_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE RESTRICT,
  activity_id UUID NOT NULL REFERENCES public.activities(id) ON DELETE RESTRICT,
  points_awarded NUMERIC NOT NULL,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'UNDONE', 'MODIFIED')),
  notes TEXT,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 6. SCORE AUDIT LOGS TABLE
-- Complete audit trail for CREATE, EDIT, and UNDO
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.score_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id UUID NOT NULL REFERENCES public.score_transactions(id) ON DELETE CASCADE,
  action TEXT NOT NULL CHECK (action IN ('CREATE', 'EDIT', 'UNDO')),
  performed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  old_value JSONB,
  new_value JSONB,
  reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 7. PERFORMANCE INDEXES
-- Optimized for high-concurrency event scoring & leaderboard queries
-- ------------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_teams_code ON public.teams(code);
CREATE INDEX IF NOT EXISTS idx_activities_code ON public.activities(code);
CREATE INDEX IF NOT EXISTS idx_activities_category ON public.activities(category);
CREATE INDEX IF NOT EXISTS idx_scoring_rules_activity ON public.scoring_rules(activity_id);
CREATE INDEX IF NOT EXISTS idx_score_transactions_team ON public.score_transactions(team_id);
CREATE INDEX IF NOT EXISTS idx_score_transactions_activity ON public.score_transactions(activity_id);
CREATE INDEX IF NOT EXISTS idx_score_transactions_status ON public.score_transactions(status);
CREATE INDEX IF NOT EXISTS idx_score_transactions_created_at ON public.score_transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_score_transactions_team_act_status ON public.score_transactions(team_id, activity_id, status);
CREATE INDEX IF NOT EXISTS idx_score_audit_logs_transaction ON public.score_audit_logs(transaction_id);
CREATE INDEX IF NOT EXISTS idx_score_audit_logs_action ON public.score_audit_logs(action);

-- ------------------------------------------------------------------------------
-- 8. COMPUTED LEADERBOARD VIEW
-- Mathematically aggregates total scores strictly from active transactions
-- ------------------------------------------------------------------------------
CREATE OR REPLACE VIEW public.team_leaderboard AS
SELECT
  t.id AS team_id,
  t.code,
  t.name,
  t.motto,
  t.avatar_url,
  t.color_accent,
  t.is_active,
  COALESCE(SUM(CASE WHEN st.status = 'ACTIVE' THEN st.points_awarded ELSE 0 END), 0) AS total_score,
  COUNT(CASE WHEN st.status = 'ACTIVE' THEN 1 END) AS total_transactions,
  DENSE_RANK() OVER (
    ORDER BY COALESCE(SUM(CASE WHEN st.status = 'ACTIVE' THEN st.points_awarded ELSE 0 END), 0) DESC,
             t.code ASC
  ) AS rank
FROM public.teams t
LEFT JOIN public.score_transactions st ON t.id = st.team_id
WHERE t.is_active = TRUE
GROUP BY t.id, t.code, t.name, t.motto, t.avatar_url, t.color_accent, t.is_active;

-- ------------------------------------------------------------------------------
-- 9. TRIGGERS & BUSINESS LOGIC CONSTRAINTS
-- ------------------------------------------------------------------------------

-- Helper: Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION public.trigger_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.trigger_set_updated_at();

CREATE OR REPLACE TRIGGER trg_teams_updated_at
  BEFORE UPDATE ON public.teams
  FOR EACH ROW EXECUTE FUNCTION public.trigger_set_updated_at();

CREATE OR REPLACE TRIGGER trg_activities_updated_at
  BEFORE UPDATE ON public.activities
  FOR EACH ROW EXECUTE FUNCTION public.trigger_set_updated_at();

CREATE OR REPLACE TRIGGER trg_scoring_rules_updated_at
  BEFORE UPDATE ON public.scoring_rules
  FOR EACH ROW EXECUTE FUNCTION public.trigger_set_updated_at();

CREATE OR REPLACE TRIGGER trg_score_transactions_updated_at
  BEFORE UPDATE ON public.score_transactions
  FOR EACH ROW EXECUTE FUNCTION public.trigger_set_updated_at();

-- Business Rule: Enforce Duplicate Prevention for One-time Activities at DB level
CREATE OR REPLACE FUNCTION public.check_duplicate_score_transaction()
RETURNS TRIGGER AS $$
DECLARE
  v_is_repeatable BOOLEAN;
  v_activity_name TEXT;
  v_team_code TEXT;
BEGIN
  -- Only validate active submissions
  IF NEW.status = 'ACTIVE' THEN
    SELECT is_repeatable, name INTO v_is_repeatable, v_activity_name
    FROM public.activities
    WHERE id = NEW.activity_id;

    IF NOT v_is_repeatable THEN
      IF EXISTS (
        SELECT 1 FROM public.score_transactions
        WHERE team_id = NEW.team_id
          AND activity_id = NEW.activity_id
          AND status = 'ACTIVE'
          AND id <> COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid)
      ) THEN
        SELECT code INTO v_team_code FROM public.teams WHERE id = NEW.team_id;
        RAISE EXCEPTION 'Đội % đã được chấm điểm cho hoạt động một lần "%". Vui lòng chỉnh sửa giao dịch cũ nếu cần điều chỉnh.',
          v_team_code, v_activity_name;
      END IF;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trg_check_duplicate_transaction
  BEFORE INSERT OR UPDATE ON public.score_transactions
  FOR EACH ROW EXECUTE FUNCTION public.check_duplicate_score_transaction();

-- Auto-sync New Auth Users to Profiles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'role', 'SCORER')
  )
  ON CONFLICT (id) DO UPDATE
    SET email = EXCLUDED.email,
        full_name = EXCLUDED.full_name;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Uncomment below when running against live Supabase Auth
-- CREATE OR REPLACE TRIGGER on_auth_user_created
--   AFTER INSERT ON auth.users
--   FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ------------------------------------------------------------------------------
-- 10. ROW LEVEL SECURITY (RLS) POLICIES
-- Strict Security Enforcement
-- ------------------------------------------------------------------------------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scoring_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.score_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.score_audit_logs ENABLE ROW LEVEL SECURITY;

-- Helper function to inspect current user role safely
CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS TEXT AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- PROFILES POLICIES
CREATE POLICY "Profiles viewable by authenticated users"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Admins have full access to profiles"
  ON public.profiles FOR ALL
  TO authenticated
  USING (public.current_user_role() = 'ADMIN');

-- TEAMS POLICIES
CREATE POLICY "Public can view teams"
  ON public.teams FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage teams"
  ON public.teams FOR ALL
  TO authenticated
  USING (public.current_user_role() = 'ADMIN');

-- ACTIVITIES POLICIES
CREATE POLICY "Public can view activities"
  ON public.activities FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage activities"
  ON public.activities FOR ALL
  TO authenticated
  USING (public.current_user_role() = 'ADMIN');

-- SCORING RULES POLICIES
CREATE POLICY "Public can view scoring rules"
  ON public.scoring_rules FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage scoring rules"
  ON public.scoring_rules FOR ALL
  TO authenticated
  USING (public.current_user_role() = 'ADMIN');

-- SCORE TRANSACTIONS POLICIES
-- Public can view active transactions for leaderboard transparency
CREATE POLICY "Public can view active transactions"
  ON public.score_transactions FOR SELECT
  USING (status = 'ACTIVE');

-- Scorers and Admins can view all transactions (including undone)
CREATE POLICY "Staff can view all transactions"
  ON public.score_transactions FOR SELECT
  TO authenticated
  USING (public.current_user_role() IN ('ADMIN', 'SCORER'));

-- Scorers and Admins can insert score transactions
CREATE POLICY "Staff can insert score transactions"
  ON public.score_transactions FOR INSERT
  TO authenticated
  WITH CHECK (public.current_user_role() IN ('ADMIN', 'SCORER'));

-- Only Admins can modify or undo transactions
CREATE POLICY "Only admins can update transactions"
  ON public.score_transactions FOR UPDATE
  TO authenticated
  USING (public.current_user_role() = 'ADMIN')
  WITH CHECK (public.current_user_role() = 'ADMIN');

-- Only Admins can delete transactions
CREATE POLICY "Only admins can delete transactions"
  ON public.score_transactions FOR DELETE
  TO authenticated
  USING (public.current_user_role() = 'ADMIN');

-- SCORE AUDIT LOGS POLICIES
CREATE POLICY "Staff can insert audit logs"
  ON public.score_audit_logs FOR INSERT
  TO authenticated
  WITH CHECK (public.current_user_role() IN ('ADMIN', 'SCORER'));

CREATE POLICY "Admins can view audit logs"
  ON public.score_audit_logs FOR SELECT
  TO authenticated
  USING (public.current_user_role() = 'ADMIN');

-- ------------------------------------------------------------------------------
-- 11. SUPABASE REALTIME REPLICATION
-- ------------------------------------------------------------------------------
DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.score_transactions;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.teams;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.score_audit_logs;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- ------------------------------------------------------------------------------
-- 12. SEED: ALL 14 TEAMS
-- ------------------------------------------------------------------------------
INSERT INTO public.teams (code, name, motto, color_accent, avatar_url) VALUES
('BDA', 'Big Data Analytics', 'Data Driven, Future Proven', '#0284c7', 'https://api.dicebear.com/7.x/identicon/svg?seed=BDA'),
('BEL', 'Business Enterprise Leadership', 'Leading Tomorrow with Vision', '#2563eb', 'https://api.dicebear.com/7.x/identicon/svg?seed=BEL'),
('AIT', 'Artificial Intelligence & Tech', 'Innovate the Future with AI', '#4f46e5', 'https://api.dicebear.com/7.x/identicon/svg?seed=AIT'),
('HELP', 'Health & Life Sciences Pioneers', 'Care, Cure, and Conquer', '#059669', 'https://api.dicebear.com/7.x/identicon/svg?seed=HELP'),
('DB', 'Digital Business', 'Digitize, Disrupt, Deliver', '#0891b2', 'https://api.dicebear.com/7.x/identicon/svg?seed=DB'),
('AAI', 'Applied Artificial Intelligence', 'Smart Intelligence in Action', '#7c3aed', 'https://api.dicebear.com/7.x/identicon/svg?seed=AAI'),
('IB', 'International Business', 'Global Mindset, Endless Impact', '#0d9488', 'https://api.dicebear.com/7.x/identicon/svg?seed=IB'),
('AC', 'Advanced Computing', 'Precision, Performance, Power', '#3b82f6', 'https://api.dicebear.com/7.x/identicon/svg?seed=AC'),
('DC', 'Digital Communications', 'Connect Minds, Inspire Voices', '#d97706', 'https://api.dicebear.com/7.x/identicon/svg?seed=DC'),
('ICE', 'Innovation & Creative Engineering', 'Crafting Ideas into Reality', '#e11d48', 'https://api.dicebear.com/7.x/identicon/svg?seed=ICE'),
('ISEL', 'Info Systems & Enterprise Logic', 'Logical Architecture for Tomorrow', '#10b981', 'https://api.dicebear.com/7.x/identicon/svg?seed=ISEL'),
('FDB', 'FinTech & Digital Banking', 'The Currency of Innovation', '#6366f1', 'https://api.dicebear.com/7.x/identicon/svg?seed=FDB'),
('MIS', 'Management Information Systems', 'Bridging Strategy and Technology', '#8b5cf6', 'https://api.dicebear.com/7.x/identicon/svg?seed=MIS'),
('KEUKA', 'Keuka College Global Warriors', 'Courage, Honor, Excellence', '#ea580c', 'https://api.dicebear.com/7.x/identicon/svg?seed=KEUKA')
ON CONFLICT (code) DO UPDATE
SET name = EXCLUDED.name,
    motto = EXCLUDED.motto,
    color_accent = EXCLUDED.color_accent,
    avatar_url = EXCLUDED.avatar_url;

-- ------------------------------------------------------------------------------
-- 13. SEED: ALL SPECIFIED SCORING RULES & ACTIVITIES
-- ------------------------------------------------------------------------------
DO $$
DECLARE
  v_lab1 UUID;
  v_lab2 UUID;
  v_hero1 UUID;
  v_hero2 UUID;
  v_discipline UUID;
  v_cheers UUID;
BEGIN
  -- 13.1. Lab 1: FIXED +15 points
  INSERT INTO public.activities (code, name, category, description, rule_type, is_repeatable, display_order)
  VALUES (
    'LAB_1',
    'Lab 1 Challenge',
    'ACADEMIC',
    'Hoàn thành bài thực hành Lab 1 với tiêu chuẩn iSER. Điểm cố định +15 điểm khi hoàn thành.',
    'FIXED',
    FALSE,
    1
  )
  ON CONFLICT (code) DO UPDATE
    SET name = EXCLUDED.name, description = EXCLUDED.description, rule_type = EXCLUDED.rule_type
  RETURNING id INTO v_lab1;

  INSERT INTO public.scoring_rules (activity_id, rule_type, config)
  VALUES (
    v_lab1,
    'FIXED',
    '{
      "points": 15
    }'::jsonb
  )
  ON CONFLICT (activity_id) DO UPDATE
    SET rule_type = EXCLUDED.rule_type, config = EXCLUDED.config;

  -- 13.2. Lab 2: FIXED +15 points
  INSERT INTO public.activities (code, name, category, description, rule_type, is_repeatable, display_order)
  VALUES (
    'LAB_2',
    'Lab 2 Challenge',
    'ACADEMIC',
    'Hoàn thành bài thực hành Lab 2 với tiêu chuẩn iSER. Điểm cố định +15 điểm khi hoàn thành.',
    'FIXED',
    FALSE,
    2
  )
  ON CONFLICT (code) DO UPDATE
    SET name = EXCLUDED.name, description = EXCLUDED.description, rule_type = EXCLUDED.rule_type
  RETURNING id INTO v_lab2;

  INSERT INTO public.scoring_rules (activity_id, rule_type, config)
  VALUES (
    v_lab2,
    'FIXED',
    '{
      "points": 15
    }'::jsonb
  )
  ON CONFLICT (activity_id) DO UPDATE
    SET rule_type = EXCLUDED.rule_type, config = EXCLUDED.config;

  -- 13.3. Hero 1: RANKING (Rank 1 = +30, Rank 2 = +25, Rank 3 = +20)
  INSERT INTO public.activities (code, name, category, description, rule_type, is_repeatable, display_order)
  VALUES (
    'HERO_1',
    'Hero 1 Competition',
    'CHALLENGE',
    'Cuộc thi tranh tài đối kháng Hero 1. Xếp hạng Top 3 nhận điểm thưởng tương ứng.',
    'RANKING',
    FALSE,
    3
  )
  ON CONFLICT (code) DO UPDATE
    SET name = EXCLUDED.name, description = EXCLUDED.description, rule_type = EXCLUDED.rule_type
  RETURNING id INTO v_hero1;

  INSERT INTO public.scoring_rules (activity_id, rule_type, config)
  VALUES (
    v_hero1,
    'RANKING',
    '{
      "ranks": {
        "1": 30,
        "2": 25,
        "3": 20
      }
    }'::jsonb
  )
  ON CONFLICT (activity_id) DO UPDATE
    SET rule_type = EXCLUDED.rule_type, config = EXCLUDED.config;

  -- 13.4. Hero 2: RANKING (Rank 1 = +20, Rank 2 = +15, Rank 3 = +10)
  INSERT INTO public.activities (code, name, category, description, rule_type, is_repeatable, display_order)
  VALUES (
    'HERO_2',
    'Hero 2 Arena',
    'CHALLENGE',
    'Thử thách phối hợp đồng đội Hero 2. Xếp hạng Top 3 nhận điểm thưởng tương ứng.',
    'RANKING',
    FALSE,
    4
  )
  ON CONFLICT (code) DO UPDATE
    SET name = EXCLUDED.name, description = EXCLUDED.description, rule_type = EXCLUDED.rule_type
  RETURNING id INTO v_hero2;

  INSERT INTO public.scoring_rules (activity_id, rule_type, config)
  VALUES (
    v_hero2,
    'RANKING',
    '{
      "ranks": {
        "1": 20,
        "2": 15,
        "3": 10
      }
    }'::jsonb
  )
  ON CONFLICT (activity_id) DO UPDATE
    SET rule_type = EXCLUDED.rule_type, config = EXCLUDED.config;

  -- 13.5. Discipline: QUANTITY
  -- "Mất trật tự" -70 per occurrence
  -- "Sử dụng điện thoại sai mục đích" -50 per occurrence
  -- "Vệ sinh" -30 per occurrence
  -- "Đến muộn" -30 per occurrence
  -- "Ra khỏi khu vực" -50 per occurrence
  -- Positive contribution: +30 per occurrence
  INSERT INTO public.activities (code, name, category, description, rule_type, is_repeatable, display_order)
  VALUES (
    'DISCIPLINE',
    'Nề nếp & Kỷ luật iSER',
    'DISCIPLINE',
    'Quy định kỷ luật trại và ghi nhận đóng góp tích cực theo số lần vi phạm hoặc thành tích.',
    'QUANTITY',
    TRUE,
    5
  )
  ON CONFLICT (code) DO UPDATE
    SET name = EXCLUDED.name, description = EXCLUDED.description, rule_type = EXCLUDED.rule_type
  RETURNING id INTO v_discipline;

  INSERT INTO public.scoring_rules (activity_id, rule_type, config)
  VALUES (
    v_discipline,
    'QUANTITY',
    '{
      "items": [
        {
          "id": "noise",
          "label": "Mất trật tự",
          "points": -70
        },
        {
          "id": "phone",
          "label": "Sử dụng điện thoại sai mục đích",
          "points": -50
        },
        {
          "id": "hygiene",
          "label": "Vệ sinh",
          "points": -30
        },
        {
          "id": "late",
          "label": "Đến muộn",
          "points": -30
        },
        {
          "id": "out_of_bounds",
          "label": "Ra khỏi khu vực",
          "points": -50
        },
        {
          "id": "positive_contribution",
          "label": "Đóng góp tích cực (Positive contribution)",
          "points": 30
        }
      ]
    }'::jsonb
  )
  ON CONFLICT (activity_id) DO UPDATE
    SET rule_type = EXCLUDED.rule_type, config = EXCLUDED.config;

  -- 13.6. CHEERS: FORMULA
  -- Morning score and afternoon score fields as a configurable formula
  INSERT INTO public.activities (code, name, category, description, rule_type, is_repeatable, display_order)
  VALUES (
    'CHEERS',
    'CHEERS Spirit Challenge',
    'SPIRIT',
    'Điểm tinh thần đồng đội phiên sáng và chiều, tính theo công thức trọng số.',
    'FORMULA',
    FALSE,
    6
  )
  ON CONFLICT (code) DO UPDATE
    SET name = EXCLUDED.name, description = EXCLUDED.description, rule_type = EXCLUDED.rule_type
  RETURNING id INTO v_cheers;

  INSERT INTO public.scoring_rules (activity_id, rule_type, config)
  VALUES (
    v_cheers,
    'FORMULA',
    '{
      "formula_name": "Weighted Session Cheers",
      "expression": "round(morning * 0.4 + afternoon * 0.6)",
      "description": "Điểm tổng = Điểm sáng × 40% + Điểm chiều × 60%",
      "fields": [
        {
          "key": "morning",
          "label": "Điểm phiên Sáng (Morning)",
          "min": 0,
          "max": 100,
          "weight": 0.4
        },
        {
          "key": "afternoon",
          "label": "Điểm phiên Chiều (Afternoon)",
          "min": 0,
          "max": 100,
          "weight": 0.6
        }
      ]
    }'::jsonb
  )
  ON CONFLICT (activity_id) DO UPDATE
    SET rule_type = EXCLUDED.rule_type, config = EXCLUDED.config;

END $$;
