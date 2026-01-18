import {
  pgTable,
  text,
  timestamp,
  integer,
  boolean,
  decimal,
  pgEnum,
  jsonb,
  varchar,
  primaryKey,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import type { AdapterAccount } from "next-auth/adapters";

// ============================================
// Enums
// ============================================

export const invoiceStatusEnum = pgEnum("invoice_status", [
  "draft",
  "sent",
  "paid",
  "overdue",
  "partially_paid",
  "disputed",
  "cancelled",
]);

// ============================================
// Auth.js Tables (NextAuth Drizzle Adapter)
// ============================================

export const users = pgTable("users", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name"),
  email: text("email").unique(),
  emailVerified: timestamp("email_verified", { mode: "date" }),
  image: text("image"),

  // Profile fields
  phone: varchar("phone", { length: 20 }),
  address: text("address"),
  city: varchar("city", { length: 100 }),
  postalCode: varchar("postal_code", { length: 20 }),
  country: varchar("country", { length: 100 }).default("France"),

  // Business fields
  companyName: varchar("company_name", { length: 255 }),
  companyLogo: text("company_logo"),
  siret: varchar("siret", { length: 14 }),
  siren: varchar("siren", { length: 9 }),
  vatNumber: varchar("vat_number", { length: 20 }),

  // Banking
  iban: text("iban"), // encrypted
  bic: varchar("bic", { length: 11 }),
  bankName: varchar("bank_name", { length: 255 }),
  bankAddress: text("bank_address"),

  // Invoice settings
  invoicePrefix: varchar("invoice_prefix", { length: 10 }).default("F"),
  nextInvoiceNumber: integer("next_invoice_number").default(1),
  defaultTaxRate: decimal("default_tax_rate", { precision: 5, scale: 2 }).default("20.00"),
  defaultPaymentTerms: integer("default_payment_terms").default(30), // days
  defaultMessage: text("default_message"),

  // Stripe
  stripeCustomerId: text("stripe_customer_id"),
  stripeAccountId: text("stripe_account_id"), // For Stripe Connect

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const accounts = pgTable(
  "accounts",
  {
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").$type<AdapterAccount["type"]>().notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("provider_account_id").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (account) => [
    primaryKey({ columns: [account.provider, account.providerAccountId] }),
  ]
);

export const sessions = pgTable("sessions", {
  sessionToken: text("session_token").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});

export const verificationTokens = pgTable(
  "verification_tokens",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (token) => [primaryKey({ columns: [token.identifier, token.token] })]
);

// ============================================
// Application Tables
// ============================================

export const clients = pgTable("clients", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),

  // Company info
  companyName: varchar("company_name", { length: 255 }).notNull(),
  contactName: varchar("contact_name", { length: 255 }),
  contactTitle: varchar("contact_title", { length: 100 }),
  email: text("email").notNull(),
  phone: varchar("phone", { length: 20 }),

  // Address
  address: text("address"),
  city: varchar("city", { length: 100 }),
  postalCode: varchar("postal_code", { length: 20 }),
  country: varchar("country", { length: 100 }).default("France"),

  // Business identifiers
  siret: varchar("siret", { length: 14 }),
  siren: varchar("siren", { length: 9 }),
  vatNumber: varchar("vat_number", { length: 20 }),

  // Metadata
  notes: text("notes"),
  isActive: boolean("is_active").default(true).notNull(),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const templates = pgTable("templates", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),

  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),

  // Figma source
  figmaFileKey: varchar("figma_file_key", { length: 100 }),
  figmaNodeId: varchar("figma_node_id", { length: 100 }),
  figmaUrl: text("figma_url"),

  // Parsed structure
  structure: jsonb("structure"), // FigmaDesignStructure
  mappings: jsonb("mappings"), // Variable mappings
  styleOverrides: jsonb("style_overrides"), // User style modifications

  // Dimensions
  width: integer("width"),
  height: integer("height"),

  // Preview
  thumbnailUrl: text("thumbnail_url"),

  isDefault: boolean("is_default").default(false),
  isActive: boolean("is_active").default(true).notNull(),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const invoices = pgTable("invoices", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  clientId: text("client_id")
    .notNull()
    .references(() => clients.id, { onDelete: "restrict" }),
  templateId: text("template_id")
    .references(() => templates.id, { onDelete: "set null" }),

  // Invoice info
  number: varchar("number", { length: 50 }).notNull(),
  status: invoiceStatusEnum("status").default("draft").notNull(),

  // Dates
  issueDate: timestamp("issue_date", { mode: "date" }).notNull(),
  dueDate: timestamp("due_date", { mode: "date" }).notNull(),
  paidAt: timestamp("paid_at", { mode: "date" }),

  // Amounts
  subtotal: decimal("subtotal", { precision: 12, scale: 2 }).default("0").notNull(),
  taxRate: decimal("tax_rate", { precision: 5, scale: 2 }).default("20.00").notNull(),
  taxAmount: decimal("tax_amount", { precision: 12, scale: 2 }).default("0").notNull(),
  total: decimal("total", { precision: 12, scale: 2 }).default("0").notNull(),
  amountPaid: decimal("amount_paid", { precision: 12, scale: 2 }).default("0").notNull(),
  currency: varchar("currency", { length: 3 }).default("EUR").notNull(),

  // Custom message
  message: text("message"),
  terms: text("terms"),

  // Payment link
  paymentToken: text("payment_token").unique(),
  paymentTokenExpiresAt: timestamp("payment_token_expires_at"),
  allowPartialPayment: boolean("allow_partial_payment").default(false),

  // Style overrides (per invoice)
  styleOverrides: jsonb("style_overrides"),

  // Snapshot of sender/recipient at invoice creation
  senderSnapshot: jsonb("sender_snapshot"),
  recipientSnapshot: jsonb("recipient_snapshot"),

  // Stripe
  stripePaymentIntentId: text("stripe_payment_intent_id"),
  stripeCheckoutSessionId: text("stripe_checkout_session_id"),

  // PDF
  pdfUrl: text("pdf_url"),
  pdfGeneratedAt: timestamp("pdf_generated_at"),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const invoiceItems = pgTable("invoice_items", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  invoiceId: text("invoice_id")
    .notNull()
    .references(() => invoices.id, { onDelete: "cascade" }),

  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  quantity: decimal("quantity", { precision: 10, scale: 2 }).default("1").notNull(),
  unitPrice: decimal("unit_price", { precision: 12, scale: 2 }).notNull(),
  total: decimal("total", { precision: 12, scale: 2 }).notNull(),

  sortOrder: integer("sort_order").default(0).notNull(),

  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const payments = pgTable("payments", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  invoiceId: text("invoice_id")
    .notNull()
    .references(() => invoices.id, { onDelete: "cascade" }),

  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 3 }).default("EUR").notNull(),

  // Stripe
  stripePaymentIntentId: text("stripe_payment_intent_id"),
  stripeChargeId: text("stripe_charge_id"),

  // Status
  status: varchar("status", { length: 50 }).default("succeeded").notNull(),

  // Metadata
  payerEmail: text("payer_email"),
  paymentMethod: varchar("payment_method", { length: 50 }),

  paidAt: timestamp("paid_at").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const invoiceHistory = pgTable("invoice_history", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  invoiceId: text("invoice_id")
    .notNull()
    .references(() => invoices.id, { onDelete: "cascade" }),

  action: varchar("action", { length: 50 }).notNull(),
  fromStatus: varchar("from_status", { length: 50 }),
  toStatus: varchar("to_status", { length: 50 }),

  metadata: jsonb("metadata"),

  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const emailLogs = pgTable("email_logs", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  invoiceId: text("invoice_id")
    .references(() => invoices.id, { onDelete: "set null" }),

  type: varchar("type", { length: 50 }).notNull(),
  recipient: text("recipient").notNull(),
  subject: text("subject").notNull(),

  status: varchar("status", { length: 50 }).default("sent").notNull(),
  resendId: text("resend_id"),

  metadata: jsonb("metadata"),

  sentAt: timestamp("sent_at").defaultNow().notNull(),
});

// ============================================
// Relations
// ============================================

export const usersRelations = relations(users, ({ many }) => ({
  accounts: many(accounts),
  sessions: many(sessions),
  clients: many(clients),
  templates: many(templates),
  invoices: many(invoices),
  emailLogs: many(emailLogs),
}));

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, {
    fields: [accounts.userId],
    references: [users.id],
  }),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id],
  }),
}));

export const clientsRelations = relations(clients, ({ one, many }) => ({
  user: one(users, {
    fields: [clients.userId],
    references: [users.id],
  }),
  invoices: many(invoices),
}));

export const templatesRelations = relations(templates, ({ one, many }) => ({
  user: one(users, {
    fields: [templates.userId],
    references: [users.id],
  }),
  invoices: many(invoices),
}));

export const invoicesRelations = relations(invoices, ({ one, many }) => ({
  user: one(users, {
    fields: [invoices.userId],
    references: [users.id],
  }),
  client: one(clients, {
    fields: [invoices.clientId],
    references: [clients.id],
  }),
  template: one(templates, {
    fields: [invoices.templateId],
    references: [templates.id],
  }),
  items: many(invoiceItems),
  payments: many(payments),
  history: many(invoiceHistory),
}));

export const invoiceItemsRelations = relations(invoiceItems, ({ one }) => ({
  invoice: one(invoices, {
    fields: [invoiceItems.invoiceId],
    references: [invoices.id],
  }),
}));

export const paymentsRelations = relations(payments, ({ one }) => ({
  invoice: one(invoices, {
    fields: [payments.invoiceId],
    references: [invoices.id],
  }),
}));

export const invoiceHistoryRelations = relations(invoiceHistory, ({ one }) => ({
  invoice: one(invoices, {
    fields: [invoiceHistory.invoiceId],
    references: [invoices.id],
  }),
}));

export const emailLogsRelations = relations(emailLogs, ({ one }) => ({
  user: one(users, {
    fields: [emailLogs.userId],
    references: [users.id],
  }),
  invoice: one(invoices, {
    fields: [emailLogs.invoiceId],
    references: [invoices.id],
  }),
}));
