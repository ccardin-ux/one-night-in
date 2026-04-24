import { pgTable, text, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const datePlansTable = pgTable("date_plans", {
  month: integer("month").primaryKey(),
  monthName: text("month_name").notNull(),
  theme: text("theme").notNull(),
  destination: text("destination").notNull(),
  tagline: text("tagline").notNull(),
  intro: text("intro").notNull(),
  dinner: jsonb("dinner").notNull(),
  music: jsonb("music").notNull(),
  ritual: jsonb("ritual").notNull(),
  conversationPrompts: jsonb("conversation_prompts").notNull(),
  activity: jsonb("activity").notNull(),
  localAddOn: jsonb("local_add_on").notNull(),
  effort: text("effort").notNull(),
  cost: text("cost").notNull(),
  duration: text("duration").notNull(),
  scheduledDate: text("scheduled_date"),
  completed: boolean("completed").notNull().default(false),
  completedAt: text("completed_at"),
});

export const insertDatePlanSchema = createInsertSchema(datePlansTable);
export type InsertDatePlan = z.infer<typeof insertDatePlanSchema>;
export type DatePlan = typeof datePlansTable.$inferSelect;
