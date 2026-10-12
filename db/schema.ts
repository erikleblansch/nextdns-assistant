import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const connections = sqliteTable("nextdns_connections", {
  userId: text("user_id").primaryKey(),
  encryptedKey: text("encrypted_key").notNull(),
  profileId: text("profile_id").notNull(),
  profileName: text("profile_name").notNull(),
  allowWrites: integer("allow_writes").notNull().default(0),
  revision: text("revision").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const changePlans = sqliteTable("nextdns_change_plans", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  connectionRevision: text("connection_revision").notNull(),
  profileId: text("profile_id").notNull(),
  kind: text("kind").notNull(),
  plan: text("plan").notNull(),
  state: text("state").notNull().default("pending"),
  result: text("result"),
  expiresAt: integer("expires_at").notNull(),
  createdAt: text("created_at").notNull(),
});
