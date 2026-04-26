ALTER TABLE "checklist_items" ADD COLUMN "phase" integer DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE "checklist_items" ADD COLUMN "person" text DEFAULT 'both' NOT NULL;