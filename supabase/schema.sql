-- ========================================================
-- fishy.io Database Schema
-- Run this in your Supabase SQL Editor
-- ========================================================

-- Enable UUID extension (usually already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- --------------------------------------------------------
-- fishes table
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.fishes (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name       TEXT NOT NULL CHECK (char_length(name) BETWEEN 1 AND 30),
  color      TEXT NOT NULL DEFAULT '#89c4e1',
  size       INTEGER NOT NULL DEFAULT 3 CHECK (size BETWEEN 1 AND 5),
  speed      INTEGER NOT NULL DEFAULT 3 CHECK (speed BETWEEN 1 AND 5),
  drawing    JSONB DEFAULT '{"strokes": []}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- --------------------------------------------------------
-- Indexes
-- --------------------------------------------------------
CREATE INDEX IF NOT EXISTS fishes_user_id_idx ON public.fishes(user_id);
CREATE INDEX IF NOT EXISTS fishes_created_at_idx ON public.fishes(created_at DESC);

-- --------------------------------------------------------
-- Row Level Security
-- --------------------------------------------------------
ALTER TABLE public.fishes ENABLE ROW LEVEL SECURITY;

-- DROP existing policies (safe to re-run)
DROP POLICY IF EXISTS "Anyone can read fishes"   ON public.fishes;
DROP POLICY IF EXISTS "Authenticated users can insert their own fish" ON public.fishes;
DROP POLICY IF EXISTS "Users can only delete their own fish" ON public.fishes;

-- READ: anyone (including anonymous visitors) can view all fish
CREATE POLICY "Anyone can read fishes"
  ON public.fishes
  FOR SELECT
  USING (true);

-- INSERT: only authenticated users can add fish, and only as themselves
CREATE POLICY "Authenticated users can insert their own fish"
  ON public.fishes
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- DELETE: users can only delete their own fish
CREATE POLICY "Users can only delete their own fish"
  ON public.fishes
  FOR DELETE
  USING (auth.uid() = user_id);

-- --------------------------------------------------------
-- Fish Limit Enforcement (Race-condition safe via Advisory Lock)
-- --------------------------------------------------------
-- Enforces:
-- 1. Maximum of 7 fish per user
-- 2. Maximum of 25 fish across the entire tank globally
CREATE OR REPLACE FUNCTION public.check_fish_limits()
RETURNS TRIGGER AS $$
DECLARE
  v_user_count INTEGER;
  v_total_count INTEGER;
BEGIN
  -- Acquire transaction-level advisory lock to serialize insertions and prevent race conditions
  PERFORM pg_advisory_xact_lock(hashtext('fishes_insert_lock'));

  -- Check per-user limit (Max 7)
  SELECT COUNT(*) INTO v_user_count
  FROM public.fishes
  WHERE user_id = NEW.user_id;

  IF v_user_count >= 7 THEN
    RAISE EXCEPTION 'USER_FISH_LIMIT_REACHED: You can have a maximum of 7 fish.'
      USING ERRCODE = 'P0001';
  END IF;

  -- Check global tank limit (Max 25)
  SELECT COUNT(*) INTO v_total_count
  FROM public.fishes;

  IF v_total_count >= 25 THEN
    RAISE EXCEPTION 'GLOBAL_FISH_LIMIT_REACHED: There are already 25 fish in the tank.'
      USING ERRCODE = 'P0002';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_check_fish_limits ON public.fishes;
CREATE TRIGGER trg_check_fish_limits
BEFORE INSERT ON public.fishes
FOR EACH ROW
EXECUTE FUNCTION public.check_fish_limits();

-- --------------------------------------------------------
-- Realtime: enable replication for fishes table
-- --------------------------------------------------------
-- Run this in the Supabase dashboard under Database > Replication,
-- or execute:
ALTER TABLE public.fishes REPLICA IDENTITY FULL;

-- Add the fishes table to the supabase_realtime publication
-- (only needed if not already using the default publication)
-- DO $$ BEGIN
--   IF NOT EXISTS (
--     SELECT 1 FROM pg_publication_tables
--     WHERE pubname = 'supabase_realtime' AND tablename = 'fishes'
--   ) THEN
--     ALTER PUBLICATION supabase_realtime ADD TABLE public.fishes;
--   END IF;
-- END $$;

-- ========================================================
-- Done! Your fishy.io database is ready.
-- ========================================================
