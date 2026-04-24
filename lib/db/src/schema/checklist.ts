import { pgTable, text, integer, serial, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const checklistItemsTable = pgTable("checklist_items", {
  id: serial("id").primaryKey(),
  month: integer("month").notNull(),
  label: text("label").notNull(),
  completed: boolean("completed").notNull().default(false),
  phase: integer("phase").notNull().default(1),
  person: text("person").notNull().default("both"),
});

export const insertChecklistItemSchema = createInsertSchema(checklistItemsTable).omit({ id: true });
export type InsertChecklistItem = z.infer<typeof insertChecklistItemSchema>;
export type ChecklistItem = typeof checklistItemsTable.$inferSelect;
