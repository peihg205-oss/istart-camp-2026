-- ==============================================================================
-- IStart Camp 2026 Team Scoring System
-- "Unlock the iSER in you"
-- Database Migration Schema with RLS and Audit Logs
-- ==============================================================================

-- 1. Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Profiles Table (Extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('ADMIN', 'SCORER')),
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Teams Table (14 Teams)
CREATE TABLE IF NOT EXISTS public.teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  motto TEXT,
  avatar_url TEXT,
  color_accent TEXT NOT NULL DEFAULT '#0284c7',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Activities Table
CREATE TABLE IF NOT EXISTS public.activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
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

-- 5. Scoring Rules Table
CREATE TABLE IF NOT EXISTS public.scoring_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  activity_id UUID NOT NULL REFERENCES public.activities(id) ON DELETE CASCADE,
  rule_type TEXT NOT NULL CHECK (rule_type IN ('FIXED', 'RANKING', 'QUANTITY', 'FORMULA')),
  config JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. Score Transactions Table (Audit Source of Truth)
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

-- 7. Score Audit Logs Table
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

-- 8. Indexes for High Performance
CREATE INDEX IF NOT EXISTS idx_teams_code ON public.teams(code);
CREATE INDEX IF NOT EXISTS idx_activities_code ON public.activities(code);
CREATE INDEX IF NOT EXISTS idx_score_transactions_team ON public.score_transactions(team_id);
CREATE INDEX IF NOT EXISTS idx_score_transactions_activity ON public.score_transactions(activity_id);
CREATE INDEX IF NOT EXISTS idx_score_transactions_status ON public.score_transactions(status);
CREATE INDEX IF NOT EXISTS idx_score_transactions_created_at ON public.score_transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_score_audit_logs_tx ON public.score_audit_logs(transaction_id);

-- 9. Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scoring_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.score_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.score_audit_logs ENABLE ROW LEVEL SECURITY;

-- Helper function to check role safely
CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS TEXT AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Profiles Policies
CREATE POLICY "Public profiles are viewable by authenticated users"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Admins have full profile access"
  ON public.profiles FOR ALL
  USING (public.current_user_role() = 'ADMIN');

-- Teams Policies: Public readable, Admin writeable
CREATE POLICY "Teams are viewable by everyone"
  ON public.teams FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage teams"
  ON public.teams FOR ALL
  USING (public.current_user_role() = 'ADMIN');

-- Activities Policies: Public readable, Admin writeable
CREATE POLICY "Activities are viewable by everyone"
  ON public.activities FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage activities"
  ON public.activities FOR ALL
  USING (public.current_user_role() = 'ADMIN');

-- Scoring Rules Policies: Public readable, Admin writeable
CREATE POLICY "Scoring rules are viewable by everyone"
  ON public.scoring_rules FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage scoring rules"
  ON public.scoring_rules FOR ALL
  USING (public.current_user_role() = 'ADMIN');

-- Score Transactions Policies:
-- Public can view active transactions for leaderboards
CREATE POLICY "Active transactions are viewable by everyone"
  ON public.score_transactions FOR SELECT
  USING (status = 'ACTIVE');

-- Scorers and Admins can view all transactions (even undone/modified)
CREATE POLICY "Staff can view all transactions"
  ON public.score_transactions FOR SELECT
  TO authenticated
  USING (public.current_user_role() IN ('ADMIN', 'SCORER'));

-- Scorers and Admins can insert transactions
CREATE POLICY "Staff can insert transactions"
  ON public.score_transactions FOR INSERT
  TO authenticated
  WITH CHECK (public.current_user_role() IN ('ADMIN', 'SCORER'));

-- Only Admins can modify/undo transactions
CREATE POLICY "Only admins can update transactions"
  ON public.score_transactions FOR UPDATE
  TO authenticated
  USING (public.current_user_role() = 'ADMIN');

-- Score Audit Logs Policies:
CREATE POLICY "Audit logs viewable by Admins"
  ON public.score_audit_logs FOR SELECT
  TO authenticated
  USING (public.current_user_role() = 'ADMIN');

CREATE POLICY "Staff can insert audit logs"
  ON public.score_audit_logs FOR INSERT
  TO authenticated
  WITH CHECK (public.current_user_role() IN ('ADMIN', 'SCORER'));

-- 10. Realtime Replication setup
ALTER PUBLICATION supabase_realtime ADD TABLE public.score_transactions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.teams;

-- 11. Initial Seeds for Teams
INSERT INTO public.teams (code, name, motto, color_accent) VALUES
('BDA', 'Big Data Analytics', 'Data Driven, Future Proven', '#0284c7'),
('BEL', 'Business Enterprise Leadership', 'Leading Tomorrow with Vision', '#2563eb'),
('AIT', 'Artificial Intelligence & Tech', 'Innovate the Future with AI', '#4f46e5'),
('HELP', 'Health & Life Sciences Pioneers', 'Care, Cure, and Conquer', '#059669'),
('DB', 'Digital Business', 'Digitize, Disrupt, Deliver', '#0891b2'),
('AAI', 'Applied Artificial Intelligence', 'Smart Intelligence in Action', '#7c3aed'),
('IB', 'International Business', 'Global Mindset, Endless Impact', '#0d9488'),
('AC', 'Advanced Computing', 'Precision, Performance, Power', '#3b82f6'),
('DC', 'Digital Communications', 'Connect Minds, Inspire Voices', '#d97706'),
('ICE', 'Innovation & Creative Engineering', 'Crafting Ideas into Reality', '#e11d48'),
('ISEL', 'Info Systems & Enterprise Logic', 'Logical Architecture for Tomorrow', '#10b981'),
('FDB', 'FinTech & Digital Banking', 'The Currency of Innovation', '#6366f1'),
('MIS', 'Management Information Systems', 'Bridging Strategy and Technology', '#8b5cf6'),
('KEUKA', 'Keuka College Global Warriors', 'Courage, Honor, Excellence', '#ea580c')
ON CONFLICT (code) DO NOTHING;

-- 12. Initial Seeds for Activities & Scoring Rules
DO $$
DECLARE
  v_lab1 UUID;
  v_lab2 UUID;
  v_hero1 UUID;
  v_hero2 UUID;
  v_discipline UUID;
  v_cheers UUID;
BEGIN
  -- Lab 1
  INSERT INTO public.activities (code, name, category, description, rule_type, is_repeatable, display_order)
  VALUES ('LAB_1', 'Lab 1 Challenge', 'ACADEMIC', 'Hoàn thành bài thực hành Lab 1 với tiêu chuẩn iSER', 'FIXED', FALSE, 1)
  RETURNING id INTO v_lab1;

  INSERT INTO public.scoring_rules (activity_id, rule_type, config)
  VALUES (v_lab1, 'FIXED', '{"points": 15}'::jsonb);

  -- Lab 2
  INSERT INTO public.activities (code, name, category, description, rule_type, is_repeatable, display_order)
  VALUES ('LAB_2', 'Lab 2 Challenge', 'ACADEMIC', 'Hoàn thành bài thực hành Lab 2 với tiêu chuẩn iSER', 'FIXED', FALSE, 2)
  RETURNING id INTO v_lab2;

  INSERT INTO public.scoring_rules (activity_id, rule_type, config)
  VALUES (v_lab2, 'FIXED', '{"points": 15}'::jsonb);

  -- Hero 1
  INSERT INTO public.activities (code, name, category, description, rule_type, is_repeatable, display_order)
  VALUES ('HERO_1', 'Hero 1 Competition', 'CHALLENGE', 'Cuộc thi tranh tài Hero 1 vòng đối kháng', 'RANKING', FALSE, 3)
  RETURNING id INTO v_hero1;

  INSERT INTO public.scoring_rules (activity_id, rule_type, config)
  VALUES (v_hero1, 'RANKING', '{"ranks": {"1": 30, "2": 25, "3": 20}}'::jsonb);

  -- Hero 2
  INSERT INTO public.activities (code, name, category, description, rule_type, is_repeatable, display_order)
  VALUES ('HERO_2', 'Hero 2 Arena', 'CHALLENGE', 'Cuộc thi tranh tài Hero 2 thử thách đồng đội', 'RANKING', FALSE, 4)
  RETURNING id INTO v_hero2;

  INSERT INTO public.scoring_rules (activity_id, rule_type, config)
  VALUES (v_hero2, 'RANKING', '{"ranks": {"1": 20, "2": 15, "3": 10}}'::jsonb);

  -- Discipline
  INSERT INTO public.activities (code, name, category, description, rule_type, is_repeatable, display_order)
  VALUES ('DISCIPLINE', 'Nề nếp & Kỷ luật iSER', 'DISCIPLINE', 'Đánh giá tác phong, nề nếp và đóng góp tích cực trong trại', 'QUANTITY', TRUE, 5)
  RETURNING id INTO v_discipline;

  INSERT INTO public.scoring_rules (activity_id, rule_type, config)
  VALUES (v_discipline, 'QUANTITY', '{
    "items": [
      {"id": "noise", "label": "Mất trật tự", "points": -70},
      {"id": "phone", "label": "Sử dụng điện thoại sai mục đích", "points": -50},
      {"id": "hygiene", "label": "Vệ sinh", "points": -30},
      {"id": "late", "label": "Đến muộn", "points": -30},
      {"id": "out_of_bounds", "label": "Ra khỏi khu vực", "points": -50},
      {"id": "positive_contribution", "label": "Đóng góp tích cực (Positive contribution)", "points": 30}
    ]
  }'::jsonb);

  -- Cheers Formula
  INSERT INTO public.activities (code, name, category, description, rule_type, is_repeatable, display_order)
  VALUES ('CHEERS', 'CHEERS Spirit Challenge', 'SPIRIT', 'Điểm tinh thần đồng đội phiên sáng và phiên chiều', 'FORMULA', FALSE, 6)
  RETURNING id INTO v_cheers;

  INSERT INTO public.scoring_rules (activity_id, rule_type, config)
  VALUES (v_cheers, 'FORMULA', '{
    "formula_name": "Weighted Session Cheers",
    "expression": "round(morning * 0.4 + afternoon * 0.6)",
    "description": "Điểm = Sáng * 40% + Chiều * 60%",
    "fields": [
      {"key": "morning", "label": "Điểm phiên Sáng (Morning)", "min": 0, "max": 100, "weight": 0.4},
      {"key": "afternoon", "label": "Điểm phiên Chiều (Afternoon)", "min": 0, "max": 100, "weight": 0.6}
    ]
  }'::jsonb);
END $$;
