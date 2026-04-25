-- Additive migration: adds fun_facts JSONB array to date_plans for spiritual/ecological destination facts.
ALTER TABLE "date_plans" ADD COLUMN IF NOT EXISTS "fun_facts" jsonb DEFAULT '[]'::jsonb NOT NULL;
