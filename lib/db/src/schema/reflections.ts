import { pgTable, text, integer, serial, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const reflectionsTable = pgTable("reflections", {
  id: serial("id").primaryKey(),
  month: integer("month").notNull(),
  highlight: text("highlight").notNull(),
  memory: text("memory").notNull(),
  learnedAboutEachOther: text("learned_about_each_other").notNull(),
  rating: integer("rating").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertReflectionSchema = createInsertSchema(reflectionsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertReflection = z.infer<typeof insertReflectionSchema>;
export type Reflection = typeof reflectionsTable.$inferSelect;
