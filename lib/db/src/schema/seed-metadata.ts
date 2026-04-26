import { pgTable, text } from "drizzle-orm/pg-core";

export const seedMetadataTable = pgTable("seed_metadata", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export type SeedMetadata = typeof seedMetadataTable.$inferSelect;
