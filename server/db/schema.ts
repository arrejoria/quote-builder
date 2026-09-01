import { pgTable, text, boolean, timestamp, integer, numeric, jsonb } from "drizzle-orm/pg-core";

// --- Better Auth required tables ---

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull().default(false),
  image: text("image"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  issuer: text("issuer"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// --- App tables ---

export const quotes = pgTable("quotes", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  quoteNumber: text("quote_number").notNull(),
  quoteDate: text("quote_date").notNull(),
  validUntil: text("valid_until").notNull(),
  status: text("status").notNull().default("borrador"),
  currency: text("currency").notNull().default("ARS"),
  taxRate: numeric("tax_rate").notNull().default("21"),
  terms: text("terms"),
  notes: text("notes"),
  companyInfo: jsonb("company_info").notNull(),
  clientInfo: jsonb("client_info").notNull(),
  logoDataUrl: text("logo_data_url"),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const quoteItems = pgTable("quote_items", {
  id: text("id").primaryKey(),
  quoteId: text("quote_id")
    .notNull()
    .references(() => quotes.id, { onDelete: "cascade" }),
  description: text("description").notNull().default(""),
  quantity: numeric("quantity").notNull().default("1"),
  price: numeric("price").notNull().default("0"),
  taxRate: numeric("tax_rate").notNull().default("0"),
  discount: numeric("discount").notNull().default("0"),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const companyProfiles = pgTable("company_profiles", {
  userId: text("user_id")
    .primaryKey()
    .references(() => user.id, { onDelete: "cascade" }),
  name: text("name").notNull().default(""),
  address: text("address"),
  phone: text("phone"),
  email: text("email"),
  website: text("website"),
  logoDataUrl: text("logo_data_url"),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
