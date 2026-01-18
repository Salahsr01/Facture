import type { users, clients, invoices, invoiceItems, templates, payments } from "@/lib/db/schema";
import type { InferSelectModel, InferInsertModel } from "drizzle-orm";

// ============================================
// Database Types
// ============================================

export type User = InferSelectModel<typeof users>;
export type NewUser = InferInsertModel<typeof users>;

export type Client = InferSelectModel<typeof clients>;
export type NewClient = InferInsertModel<typeof clients>;

export type Invoice = InferSelectModel<typeof invoices>;
export type NewInvoice = InferInsertModel<typeof invoices>;

export type InvoiceItem = InferSelectModel<typeof invoiceItems>;
export type NewInvoiceItem = InferInsertModel<typeof invoiceItems>;

export type Template = InferSelectModel<typeof templates>;
export type NewTemplate = InferInsertModel<typeof templates>;

export type Payment = InferSelectModel<typeof payments>;
export type NewPayment = InferInsertModel<typeof payments>;

// ============================================
// Invoice Status
// ============================================

export type InvoiceStatus =
  | "draft"
  | "sent"
  | "paid"
  | "overdue"
  | "partially_paid"
  | "disputed"
  | "cancelled";

// ============================================
// Figma Types
// ============================================

export interface FigmaNode {
  id: string;
  name: string;
  type: string;
  children?: FigmaNode[];
  absoluteBoundingBox?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  characters?: string;
  style?: FigmaTextStyle;
  fills?: FigmaFill[];
  strokes?: FigmaStroke[];
  effects?: FigmaEffect[];
}

export interface FigmaTextStyle {
  fontFamily?: string;
  fontPostScriptName?: string;
  fontWeight?: number;
  fontSize?: number;
  textAlignHorizontal?: "LEFT" | "CENTER" | "RIGHT" | "JUSTIFIED";
  textAlignVertical?: "TOP" | "CENTER" | "BOTTOM";
  letterSpacing?: number;
  lineHeightPx?: number;
  lineHeightPercent?: number;
}

export interface FigmaFill {
  type: "SOLID" | "GRADIENT_LINEAR" | "GRADIENT_RADIAL" | "IMAGE";
  visible?: boolean;
  opacity?: number;
  color?: {
    r: number;
    g: number;
    b: number;
    a?: number;
  };
}

export interface FigmaStroke {
  type: "SOLID" | "GRADIENT_LINEAR" | "GRADIENT_RADIAL";
  visible?: boolean;
  opacity?: number;
  color?: {
    r: number;
    g: number;
    b: number;
    a?: number;
  };
}

export interface FigmaEffect {
  type: "DROP_SHADOW" | "INNER_SHADOW" | "LAYER_BLUR" | "BACKGROUND_BLUR";
  visible?: boolean;
  radius?: number;
}

export interface FigmaDesignStructure {
  id: string;
  name: string;
  width: number;
  height: number;
  elements: FigmaElement[];
  lastSynced: string;
}

export interface FigmaElement {
  id: string;
  nodeId: string;
  name: string;
  type: "TEXT" | "FRAME" | "RECTANGLE" | "ELLIPSE" | "GROUP" | "VECTOR" | "IMAGE";
  x: number;
  y: number;
  width: number;
  height: number;
  content?: string;
  style?: {
    fontFamily?: string;
    fontSize?: number;
    fontWeight?: number;
    color?: string;
    backgroundColor?: string;
    textAlign?: string;
    opacity?: number;
  };
  variable?: string; // Mapped variable name
}

// ============================================
// Variable Mapping
// ============================================

export interface VariableMapping {
  elementId: string;
  variable: VariableName;
}

export type VariableName =
  // Invoice
  | "invoice.number"
  | "invoice.date"
  | "invoice.dueDate"
  // Sender
  | "sender.name"
  | "sender.email"
  | "sender.phone"
  | "sender.address"
  | "sender.siret"
  | "sender.siren"
  | "sender.companyName"
  | "sender.logo"
  // Recipient
  | "recipient.companyName"
  | "recipient.contactName"
  | "recipient.contactTitle"
  | "recipient.email"
  | "recipient.phone"
  | "recipient.address"
  | "recipient.siret"
  | "recipient.siren"
  // Services (repeating)
  | "service.name"
  | "service.description"
  | "service.quantity"
  | "service.unitPrice"
  | "service.total"
  // Totals
  | "totals.subtotal"
  | "totals.taxRate"
  | "totals.taxAmount"
  | "totals.total"
  // Bank
  | "bank.iban"
  | "bank.bic"
  | "bank.name"
  | "bank.address"
  // Terms
  | "terms"
  | "message";

// ============================================
// Invoice Data (for rendering)
// ============================================

export interface InvoiceData {
  invoice: {
    number: string;
    date: string;
    dueDate: string;
  };
  sender: {
    name: string;
    email: string;
    phone?: string;
    address?: string;
    siret?: string;
    siren?: string;
    companyName?: string;
    logo?: string;
  };
  recipient: {
    companyName: string;
    contactName?: string;
    contactTitle?: string;
    email: string;
    phone?: string;
    address?: string;
    siret?: string;
    siren?: string;
  };
  services: Array<{
    name: string;
    description?: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }>;
  totals: {
    subtotal: number;
    taxRate: number;
    taxAmount: number;
    total: number;
  };
  bank: {
    iban: string;
    bic: string;
    name: string;
    address?: string;
  };
  terms?: string;
  message?: string;
}

// ============================================
// API Response Types
// ============================================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// ============================================
// Form Types
// ============================================

export interface ProfileFormData {
  name: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  postalCode?: string;
  country?: string;
  companyName?: string;
  siret?: string;
  siren?: string;
  iban?: string;
  bic?: string;
  bankName?: string;
  bankAddress?: string;
}

export interface ClientFormData {
  companyName: string;
  contactName?: string;
  contactTitle?: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  postalCode?: string;
  country?: string;
  siret?: string;
  siren?: string;
}

export interface InvoiceFormData {
  clientId: string;
  templateId?: string;
  issueDate: Date;
  dueDate: Date;
  taxRate: number;
  message?: string;
  terms?: string;
  allowPartialPayment?: boolean;
  items: Array<{
    name: string;
    description?: string;
    quantity: number;
    unitPrice: number;
  }>;
}
