CREATE TABLE "date_plans" (
        "month" integer PRIMARY KEY NOT NULL,
        "month_name" text NOT NULL,
        "theme" text NOT NULL,
        "destination" text NOT NULL,
        "tagline" text NOT NULL,
        "intro" text NOT NULL,
        "dinner" jsonb NOT NULL,
        "music" jsonb NOT NULL,
        "ritual" jsonb NOT NULL,
        "conversation_prompts" jsonb NOT NULL,
        "activity" jsonb NOT NULL,
        "local_add_on" jsonb NOT NULL,
        "effort" text NOT NULL,
        "cost" text NOT NULL,
        "duration" text NOT NULL,
        "scheduled_date" text,
        "completed" boolean DEFAULT false NOT NULL,
        "completed_at" text,
        "seth_phase" integer DEFAULT 1 NOT NULL,
        "elana_phase" integer DEFAULT 1 NOT NULL,
        "seth_recipe_choice" integer,
        "elana_vibe_choice" text
);
--> statement-breakpoint
CREATE TABLE "reflections" (
        "id" serial PRIMARY KEY NOT NULL,
        "month" integer NOT NULL,
        "highlight" text NOT NULL,
        "memory" text NOT NULL,
        "learned_about_each_other" text NOT NULL,
        "rating" integer NOT NULL,
        "created_at" timestamp with time zone DEFAULT now() NOT NULL,
        "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "checklist_items" (
        "id" serial PRIMARY KEY NOT NULL,
        "month" integer NOT NULL,
        "label" text NOT NULL,
        "completed" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "favorites" (
        "id" serial PRIMARY KEY NOT NULL,
        "type" text NOT NULL,
        "content" text NOT NULL,
        "source_month" integer NOT NULL,
        "created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "learnings" (
        "id" serial PRIMARY KEY NOT NULL,
        "month" integer NOT NULL,
        "about" text NOT NULL,
        "content" text NOT NULL,
        "created_at" timestamp with time zone DEFAULT now() NOT NULL
);
