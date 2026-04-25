-- Creates seed_metadata table for tracking seed content version hash.
-- This enables safe content updates without wiping user progress data.
CREATE TABLE IF NOT EXISTS "seed_metadata" (
        "key" text PRIMARY KEY NOT NULL,
        "value" text NOT NULL,
        "updated_at" text NOT NULL
);
