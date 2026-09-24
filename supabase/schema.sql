-- ==============================================================================
-- IStart Camp 2026 - Production Database Schema & Seed Data (12 Teams)
-- Copy and paste this directly into Supabase SQL Editor, then click "Run"
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. TEAMS TABLE
CREATE TABLE IF NOT EXISTS public.teams (
  id TEXT PRIMARY KEY DEFAULT ('team-' || gen_random_uuid()::text),
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  motto TEXT,
  avatar_url TEXT,
  color_accent TEXT NOT NULL DEFAULT '#0284c7',
  badge_color TEXT,
  leader TEXT,
  assistant TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. ACTIVITIES TABLE
CREATE TABLE IF NOT EXISTS public.activities (
  id TEXT PRIMARY KEY DEFAULT ('act-' || gen_random_uuid()::text),
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

-- 4. SCORING RULES TABLE
CREATE TABLE IF NOT EXISTS public.scoring_rules (
  id TEXT PRIMARY KEY DEFAULT ('rule-' || gen_random_uuid()::text),
  activity_id TEXT NOT NULL REFERENCES public.activities(id) ON DELETE CASCADE,
  rule_type TEXT NOT NULL CHECK (rule_type IN ('FIXED', 'RANKING', 'QUANTITY', 'FORMULA')),
  config JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
  id TEXT PRIMARY KEY DEFAULT ('user-' || gen_random_uuid()::text),
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('ADMIN', 'SCORER')),
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. SCORE TRANSACTIONS TABLE
CREATE TABLE IF NOT EXISTS public.score_transactions (
  id TEXT PRIMARY KEY DEFAULT ('tx-' || gen_random_uuid()::text),
  team_id TEXT NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  activity_id TEXT NOT NULL REFERENCES public.activities(id) ON DELETE CASCADE,
  points_awarded NUMERIC NOT NULL,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'UNDONE', 'MODIFIED')),
  created_by TEXT,
  created_by_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. SCORE AUDIT LOGS TABLE
CREATE TABLE IF NOT EXISTS public.score_audit_logs (
  id TEXT PRIMARY KEY DEFAULT ('audit-' || gen_random_uuid()::text),
  transaction_id TEXT,
  action TEXT NOT NULL CHECK (action IN ('CREATE', 'UPDATE', 'UNDO')),
  performed_by TEXT,
  performed_by_name TEXT,
  old_value JSONB,
  new_value JSONB,
  reason TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. INDEXES FOR HIGH-TRAFFIC REALTIME LEADERBOARD
CREATE INDEX IF NOT EXISTS idx_score_tx_team ON public.score_transactions(team_id);
CREATE INDEX IF NOT EXISTS idx_score_tx_status ON public.score_transactions(status);
CREATE INDEX IF NOT EXISTS idx_score_tx_created ON public.score_transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_teams_code ON public.teams(code);

-- 9. ROW LEVEL SECURITY (RLS) POLICIES
-- Enable RLS
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scoring_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.score_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.score_audit_logs ENABLE ROW LEVEL SECURITY;

-- Allow public read & write for competition scoring (works seamlessly with anon key)
DROP POLICY IF EXISTS "Enable all access for teams" ON public.teams;
CREATE POLICY "Enable all access for teams" ON public.teams FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Enable all access for activities" ON public.activities;
CREATE POLICY "Enable all access for activities" ON public.activities FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Enable all access for scoring_rules" ON public.scoring_rules;
CREATE POLICY "Enable all access for scoring_rules" ON public.scoring_rules FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Enable all access for profiles" ON public.profiles;
CREATE POLICY "Enable all access for profiles" ON public.profiles FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Enable all access for score_transactions" ON public.score_transactions;
CREATE POLICY "Enable all access for score_transactions" ON public.score_transactions FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Enable all access for score_audit_logs" ON public.score_audit_logs;
CREATE POLICY "Enable all access for score_audit_logs" ON public.score_audit_logs FOR ALL USING (true) WITH CHECK (true);

-- 10. REALTIME CONFIGURATION
DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.teams;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.activities;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.score_transactions;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.score_audit_logs;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 11. SEED: 12 OFFICIAL COMPETING TEAMS
INSERT INTO public.teams (id, code, name, motto, color_accent, badge_color, avatar_url, leader, assistant) VALUES
('team-ib-1', 'IB 1', 'International Business 1', 'Global Vision, Local Action', '#60a5fa', '#e0f2fe', 'https://api.dicebear.com/7.x/identicon/svg?seed=IB1', NULL, NULL),
('team-ib-2', 'IB 2', 'International Business 2', 'Pioneering Global Leaders', '#0284c7', '#bae6fd', 'https://api.dicebear.com/7.x/identicon/svg?seed=IB2', NULL, NULL),
('team-ib3-keuka-mkt', 'IB 3 + KEUKA + MKT', 'Liên quân IB 3 + Keuka + Marketing', 'Boundless Synergy, Global Impact', '#7e22ce', '#6b21a8', '/images/teams/mkt.png', NULL, NULL),
('team-ac', 'AC', 'Accounting, Analyzing and Auditing', 'Precision, Performance, Power', '#f43f5e', '#ffe4e6', '/images/teams/ac.png', NULL, NULL),
('team-ice-aai', 'ICE + AAI', 'Liên quân ICE + AAI', 'Smart Tech, Boundless Future', '#eab308', '#fef08a', 'https://api.dicebear.com/7.x/identicon/svg?seed=ICE-AAI', NULL, NULL),
('team-fdb', 'FDB', 'Bachelor of Financial Technology and Digital Business', 'The Currency of Innovation', '#16a34a', '#bbf7d0', '/images/teams/fdb.png', NULL, NULL),
('team-bel', 'BEL', 'Business Enterprise Leadership', 'Leading Tomorrow with Vision', '#0f766e', '#115e59', 'https://api.dicebear.com/7.x/identicon/svg?seed=BEL', NULL, NULL),
('team-ait-isel', 'AIT + ISEL', 'Liên quân AIT + ISEL', 'Engineered Intelligence in Motion', '#38bdf8', '#e0f2fe', '/images/teams/ise.png', NULL, 'Vũ Thị Minh Phương, Mẫn Minh Huy'),
('team-mis', 'MIS', 'Management Information System', 'Bridging Strategy and Technology', '#f97316', '#fed7aa', '/images/teams/mis.png', 'Nguyễn Thùy Dung', 'Hoàng Lê Bích Ngọc'),
('team-bda', 'BDA', 'Business Data Analytics', 'Data Driven, Future Proven', '#78350f', '#78350f', '/images/teams/bda.png', 'Nguyễn Thị Hiền Dung', 'Hà Mạnh Nguyễn Dũng'),
('team-db', 'DB', 'Digital Business', 'Digitize, Disrupt, Deliver', '#047857', '#047857', '/images/teams/db.png', 'Trần Đức Thắng', 'Phạm Thị Minh Ánh'),
('team-dc', 'DC', 'Digital Communications', 'Voice of Connection, Power of Story', '#b91c1c', '#b91c1c', '/images/teams/dc.png', 'Hoàng Triều Xuân', 'Tống Khánh Linh')
ON CONFLICT (code) DO UPDATE
SET name = EXCLUDED.name,
    motto = EXCLUDED.motto,
    color_accent = EXCLUDED.color_accent,
    badge_color = EXCLUDED.badge_color,
    avatar_url = EXCLUDED.avatar_url,
    leader = EXCLUDED.leader,
    assistant = EXCLUDED.assistant;

-- 12. SEED: DEFAULT PROFILES
INSERT INTO public.profiles (id, email, full_name, role, avatar_url) VALUES
('user-admin-01', 'admin@istartcamp.vn', 'Camp Master Admin', 'ADMIN', 'https://api.dicebear.com/7.x/bottts/svg?seed=AdminMaster'),
('user-scorer-01', 'scorer@istartcamp.vn', 'Trọng tài viên iSER', 'SCORER', 'https://api.dicebear.com/7.x/bottts/svg?seed=ScorerOne')
ON CONFLICT (email) DO UPDATE
SET full_name = EXCLUDED.full_name,
    role = EXCLUDED.role;

-- 13. SEED: ACTIVITIES & SCORING RULES
INSERT INTO public.activities (id, code, name, category, description, rule_type, is_repeatable, display_order) VALUES
('act-baseline', 'BASELINE', 'Điểm khởi đầu Trại IStart 2026', 'SPECIAL', 'Điểm số cơ bản khởi đầu theo bảng tổng điểm chính thức của Ban Tổ Chức.', 'FIXED', TRUE, 1),
('act-lab-1', 'LAB_1', 'Lab 1: Khởi động Đội hình', 'ACADEMIC', 'Hoàn thành bài thực hành Lab 1 với tiêu chuẩn iSER.', 'FIXED', FALSE, 2),
('act-lab-2', 'LAB_2', 'Lab 2: Bứt phá Sáng tạo', 'ACADEMIC', 'Thực hành dự án Lab 2 giải quyết bài toán thực tế.', 'FIXED', FALSE, 3),
('act-hero-1', 'HERO_1', 'Hero 1: Đấu trường Sức mạnh', 'CHALLENGE', 'Vòng thi đối kháng trực tiếp Hero 1. Xếp hạng Top 3 nhận điểm thưởng.', 'RANKING', FALSE, 4),
('act-hero-2', 'HERO_2', 'Hero 2: Đỉnh cao Bứt phá', 'CHALLENGE', 'Thử thách phối hợp đồng đội Hero 2. Xếp hạng Top 3 nhận điểm thưởng.', 'RANKING', FALSE, 5),
('act-discipline', 'DISCIPLINE', 'Nề nếp & Kỷ luật iSER', 'DISCIPLINE', 'Quy định nề nếp trại và ghi nhận đóng góp tích cực.', 'QUANTITY', TRUE, 6),
('act-cheers', 'CHEERS', 'CHEERS: Tinh thần Đồng đội', 'SPIRIT', 'Chấm điểm tiếng reo hò, sự cổ vũ nhiệt huyết phiên Sáng (40%) và Chiều (60%).', 'FORMULA', TRUE, 7)
ON CONFLICT (code) DO UPDATE
SET name = EXCLUDED.name, description = EXCLUDED.description;

-- Rules configs
INSERT INTO public.scoring_rules (id, activity_id, rule_type, config) VALUES
('rule-baseline', 'act-baseline', 'FIXED', '{"points": 150}'::jsonb),
('rule-lab-1', 'act-lab-1', 'FIXED', '{"points": 15}'::jsonb),
('rule-lab-2', 'act-lab-2', 'FIXED', '{"points": 15}'::jsonb),
('rule-hero-1', 'act-hero-1', 'RANKING', '{"ranks": {"1": 30, "2": 25, "3": 20}}'::jsonb),
('rule-hero-2', 'act-hero-2', 'RANKING', '{"ranks": {"1": 20, "2": 15, "3": 10}}'::jsonb),
('rule-discipline', 'act-discipline', 'QUANTITY', '{"items": [{"id": "noise", "label": "Mất trật tự", "points": -70}, {"id": "phone", "label": "Sử dụng điện thoại sai mục đích", "points": -50}, {"id": "positive_contribution", "label": "Đóng góp tích cực", "points": 30}]}'::jsonb),
('rule-cheers', 'act-cheers', 'FORMULA', '{"formula_name": "Weighted Cheers Score", "expression": "round(morning * 0.4 + afternoon * 0.6)", "fields": [{"key": "morning", "label": "Điểm phiên Sáng", "min": 0, "max": 100, "weight": 0.4}, {"key": "afternoon", "label": "Điểm phiên Chiều", "min": 0, "max": 100, "weight": 0.6}]}'::jsonb)
ON CONFLICT (id) DO UPDATE SET config = EXCLUDED.config;

-- 14. SEED: INITIAL TRANSACTIONS MATCHING REAL SCOREBOARD
-- BDA: 300, BEL: 275, ICE + AAI: 238, IB 3 + KEUKA + MKT: 230, IB 2: 210, AIT + ISEL: 205, FDB: 200, AC: 185, DB: 185, IB 1: 150, MIS: 150, DC: 150
INSERT INTO public.score_transactions (id, team_id, activity_id, points_awarded, metadata, notes, status, created_by_name) VALUES
-- BDA (300)
('tx-bda-1', 'team-bda', 'act-baseline', 150, '{"rule_type": "FIXED"}'::jsonb, 'Điểm khởi đầu Trại IStart 2026', 'ACTIVE', 'Camp Master Admin'),
('tx-bda-2', 'team-bda', 'act-lab-1', 15, '{"rule_type": "FIXED"}'::jsonb, 'Hoàn thành xuất sắc Lab 1', 'ACTIVE', 'Trọng tài viên iSER'),
('tx-bda-3', 'team-bda', 'act-lab-2', 15, '{"rule_type": "FIXED"}'::jsonb, 'Hoàn thành dự án Lab 2', 'ACTIVE', 'Trọng tài viên iSER'),
('tx-bda-4', 'team-bda', 'act-hero-1', 30, '{"rule_type": "RANKING", "rank": 1}'::jsonb, 'Quán quân thử thách đối kháng Hero 1', 'ACTIVE', 'Camp Master Admin'),
('tx-bda-5', 'team-bda', 'act-hero-2', 20, '{"rule_type": "RANKING", "rank": 1}'::jsonb, 'Quán quân thử thách Hero 2', 'ACTIVE', 'Camp Master Admin'),
('tx-bda-6', 'team-bda', 'act-cheers', 70, '{"rule_type": "FORMULA"}'::jsonb, 'Cổ vũ bùng nổ hai phiên Sáng & Chiều', 'ACTIVE', 'Trọng tài viên iSER'),
-- BEL (275)
('tx-bel-1', 'team-bel', 'act-baseline', 150, '{"rule_type": "FIXED"}'::jsonb, 'Điểm khởi đầu Trại IStart 2026', 'ACTIVE', 'Camp Master Admin'),
('tx-bel-2', 'team-bel', 'act-lab-1', 15, '{"rule_type": "FIXED"}'::jsonb, 'Hoàn thành Lab 1', 'ACTIVE', 'Trọng tài viên iSER'),
('tx-bel-3', 'team-bel', 'act-lab-2', 15, '{"rule_type": "FIXED"}'::jsonb, 'Hoàn thành Lab 2', 'ACTIVE', 'Trọng tài viên iSER'),
('tx-bel-4', 'team-bel', 'act-hero-1', 25, '{"rule_type": "RANKING", "rank": 2}'::jsonb, 'Á quân thử thách đối kháng Hero 1', 'ACTIVE', 'Camp Master Admin'),
('tx-bel-5', 'team-bel', 'act-cheers', 70, '{"rule_type": "FORMULA"}'::jsonb, 'Cổ vũ nhiệt huyết tinh thần thủ lĩnh', 'ACTIVE', 'Trọng tài viên iSER'),
-- ICE + AAI (238)
('tx-ice-aai-1', 'team-ice-aai', 'act-baseline', 150, '{"rule_type": "FIXED"}'::jsonb, 'Điểm khởi đầu Trại IStart 2026', 'ACTIVE', 'Camp Master Admin'),
('tx-ice-aai-2', 'team-ice-aai', 'act-lab-1', 15, '{"rule_type": "FIXED"}'::jsonb, 'Hoàn thành Lab 1', 'ACTIVE', 'Trọng tài viên iSER'),
('tx-ice-aai-3', 'team-ice-aai', 'act-hero-1', 20, '{"rule_type": "RANKING", "rank": 3}'::jsonb, 'Hạng 3 thử thách Hero 1', 'ACTIVE', 'Camp Master Admin'),
('tx-ice-aai-4', 'team-ice-aai', 'act-cheers', 53, '{"rule_type": "FORMULA"}'::jsonb, 'Điểm cổ động sáng tạo công nghệ liên quân', 'ACTIVE', 'Trọng tài viên iSER'),
-- IB 3 + KEUKA + MKT (230)
('tx-ib3-1', 'team-ib3-keuka-mkt', 'act-baseline', 150, '{"rule_type": "FIXED"}'::jsonb, 'Điểm khởi đầu Trại IStart 2026', 'ACTIVE', 'Camp Master Admin'),
('tx-ib3-2', 'team-ib3-keuka-mkt', 'act-lab-1', 15, '{"rule_type": "FIXED"}'::jsonb, 'Hoàn thành Lab 1', 'ACTIVE', 'Trọng tài viên iSER'),
('tx-ib3-3', 'team-ib3-keuka-mkt', 'act-hero-2', 15, '{"rule_type": "RANKING", "rank": 2}'::jsonb, 'Á quân thử thách Hero 2', 'ACTIVE', 'Camp Master Admin'),
('tx-ib3-4', 'team-ib3-keuka-mkt', 'act-cheers', 50, '{"rule_type": "FORMULA"}'::jsonb, 'Đồng diễn cổ động liên quân 3 sắc áo', 'ACTIVE', 'Trọng tài viên iSER'),
-- IB 2 (210)
('tx-ib2-1', 'team-ib-2', 'act-baseline', 150, '{"rule_type": "FIXED"}'::jsonb, 'Điểm khởi đầu Trại IStart 2026', 'ACTIVE', 'Camp Master Admin'),
('tx-ib2-2', 'team-ib-2', 'act-lab-1', 15, '{"rule_type": "FIXED"}'::jsonb, 'Hoàn thành Lab 1', 'ACTIVE', 'Trọng tài viên iSER'),
('tx-ib2-3', 'team-ib-2', 'act-hero-2', 10, '{"rule_type": "RANKING", "rank": 3}'::jsonb, 'Hạng 3 thử thách Hero 2', 'ACTIVE', 'Camp Master Admin'),
('tx-ib2-4', 'team-ib-2', 'act-cheers', 35, '{"rule_type": "FORMULA"}'::jsonb, 'Tinh thần cổ vũ sôi nổi phiên chiều', 'ACTIVE', 'Trọng tài viên iSER'),
-- AIT + ISEL (205)
('tx-ait-isel-1', 'team-ait-isel', 'act-baseline', 150, '{"rule_type": "FIXED"}'::jsonb, 'Điểm khởi đầu Trại IStart 2026', 'ACTIVE', 'Camp Master Admin'),
('tx-ait-isel-2', 'team-ait-isel', 'act-lab-1', 15, '{"rule_type": "FIXED"}'::jsonb, 'Hoàn thành Lab 1 kỹ thuật & logistics', 'ACTIVE', 'Trọng tài viên iSER'),
('tx-ait-isel-3', 'team-ait-isel', 'act-cheers', 40, '{"rule_type": "FORMULA"}'::jsonb, 'Cổ vũ đồng đều, hô vang khẩu hiệu', 'ACTIVE', 'Trọng tài viên iSER'),
-- FDB (200)
('tx-fdb-1', 'team-fdb', 'act-baseline', 150, '{"rule_type": "FIXED"}'::jsonb, 'Điểm khởi đầu Trại IStart 2026', 'ACTIVE', 'Camp Master Admin'),
('tx-fdb-2', 'team-fdb', 'act-lab-1', 15, '{"rule_type": "FIXED"}'::jsonb, 'Hoàn thành Lab 1 Fintech', 'ACTIVE', 'Trọng tài viên iSER'),
('tx-fdb-3', 'team-fdb', 'act-cheers', 35, '{"rule_type": "FORMULA"}'::jsonb, 'Sắc xanh FDB cổ vũ nhiệt tình', 'ACTIVE', 'Trọng tài viên iSER'),
-- AC (185)
('tx-ac-1', 'team-ac', 'act-baseline', 150, '{"rule_type": "FIXED"}'::jsonb, 'Điểm khởi đầu Trại IStart 2026', 'ACTIVE', 'Camp Master Admin'),
('tx-ac-2', 'team-ac', 'act-lab-1', 15, '{"rule_type": "FIXED"}'::jsonb, 'Hoàn thành chuẩn xác Lab 1', 'ACTIVE', 'Trọng tài viên iSER'),
('tx-ac-3', 'team-ac', 'act-cheers', 20, '{"rule_type": "FORMULA"}'::jsonb, 'Cổ vũ nhịp nhàng và chuẩn mực', 'ACTIVE', 'Trọng tài viên iSER'),
-- DB (185)
('tx-db-1', 'team-db', 'act-baseline', 150, '{"rule_type": "FIXED"}'::jsonb, 'Điểm khởi đầu Trại IStart 2026', 'ACTIVE', 'Camp Master Admin'),
('tx-db-2', 'team-db', 'act-lab-1', 15, '{"rule_type": "FIXED"}'::jsonb, 'Hoàn thành Lab 1 Digital Business', 'ACTIVE', 'Trọng tài viên iSER'),
('tx-db-3', 'team-db', 'act-cheers', 20, '{"rule_type": "FORMULA"}'::jsonb, 'Tiếng hô cổ vũ mạnh mẽ', 'ACTIVE', 'Trọng tài viên iSER'),
-- IB 1 (150)
('tx-ib1-1', 'team-ib-1', 'act-baseline', 150, '{"rule_type": "FIXED"}'::jsonb, 'Điểm khởi đầu Trại IStart 2026', 'ACTIVE', 'Camp Master Admin'),
-- MIS (150)
('tx-mis-1', 'team-mis', 'act-baseline', 150, '{"rule_type": "FIXED"}'::jsonb, 'Điểm khởi đầu Trại IStart 2026', 'ACTIVE', 'Camp Master Admin'),
-- DC (150)
('tx-dc-1', 'team-dc', 'act-baseline', 150, '{"rule_type": "FIXED"}'::jsonb, 'Điểm khởi đầu Trại IStart 2026', 'ACTIVE', 'Camp Master Admin')
ON CONFLICT (id) DO NOTHING;
