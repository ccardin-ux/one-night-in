-- Additive migration: adds per-person 3-day journey fields to date_plans.
-- These columns are already included in the 0000 CREATE TABLE baseline.
-- This file provides an explicit ALTER migration for environments upgrading
-- from an install that predates the 3-day journey redesign.
ALTER TABLE "date_plans" ADD COLUMN IF NOT EXISTS "seth_phase" integer DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE "date_plans" ADD COLUMN IF NOT EXISTS "elana_phase" integer DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE "date_plans" ADD COLUMN IF NOT EXISTS "seth_recipe_choice" integer;--> statement-breakpoint
ALTER TABLE "date_plans" ADD COLUMN IF NOT EXISTS "elana_vibe_choice" text;
