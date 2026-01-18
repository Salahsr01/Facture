# Architecture Document
## FigmaInvoice

**Version:** 1.0
**Date:** 2026-01-18
**Project Level:** 2 (Medium)
**Status:** Draft
**Author:** System Architect (BMAD)

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Architectural Drivers](#2-architectural-drivers)
3. [High-Level Architecture](#3-high-level-architecture)
4. [Technology Stack](#4-technology-stack)
5. [System Components](#5-system-components)
6. [Data Architecture](#6-data-architecture)
7. [API Design](#7-api-design)
8. [Security Architecture](#8-security-architecture)
9. [Performance & Scalability](#9-performance--scalability)
10. [Reliability & Monitoring](#10-reliability--monitoring)
11. [Development & Deployment](#11-development--deployment)
12. [NFR Coverage](#12-nfr-coverage)
13. [Traceability](#13-traceability)
14. [Trade-offs & Decisions](#14-trade-offs--decisions)

---

## 1. Executive Summary

Ce document définit l'architecture technique de **FigmaInvoice**, une application web de facturation design-first pour freelances.

**Pattern architectural :** Monolithe Modulaire avec Next.js 16

**Caractéristiques clés :**
- Full-stack TypeScript avec Next.js App Router
- Base de données PostgreSQL serverless (Neon)
- Authentification OAuth Figma via Auth.js
- Paiements via Stripe Checkout
- Emails transactionnels via Resend
- Hébergement sur Vercel

**Références :**
- [PRD](./prd-figmainvoice-2026-01-18.md)
- [Product Brief](./product-brief-figmainvoice-2026-01-18.md)
- [Figma Design Analysis](./figma-design-analysis.md)

---

## 2. Architectural Drivers

Les NFRs suivants influencent significativement les décisions architecturales :

### Driver 1: Performance (NFR-001)
**Exigence :** Pages < 500ms, Import Figma < 5s, PDF < 3s

**Impact architectural :**
- Server Components pour rendu initial rapide
- Edge caching via Vercel
- Streaming pour grandes réponses
- Génération PDF asynchrone

### Driver 2: Sécurité (NFR-004, NFR-005)
**Exigence :** RGPD, HTTPS, Chiffrement DB, Tokens sécurisés

**Impact architectural :**
- Chiffrement at-rest via Neon
- Tokens chiffrés avec variables d'environnement sécurisées
- Sessions JWT courtes avec refresh tokens
- Audit logs pour actions sensibles

### Driver 3: Responsive Design (NFR-008)
**Exigence :** Full responsive (Desktop, Tablet, Mobile)

**Impact architectural :**
- Design system avec Tailwind CSS
- Components adaptatifs shadcn/ui
- L'éditeur canvas limité sur mobile

### Driver 4: Disponibilité (NFR-003)
**Exigence :** 99% uptime

**Impact architectural :**
- Infrastructure serverless (auto-scaling)
- Monitoring avec alertes
- Graceful degradation

---

## 3. High-Level Architecture

### Pattern: Monolithe Modulaire

```
┌─────────────────────────────────────────────────────────────────┐
│                           CLIENTS                                │
│                                                                  │
│    ┌──────────┐    ┌──────────┐    ┌──────────┐                │
│    │  Desktop │    │  Tablet  │    │  Mobile  │                │
│    └────┬─────┘    └────┬─────┘    └────┬─────┘                │
│         │               │               │                       │
│         └───────────────┼───────────────┘                       │
│                         │                                        │
└─────────────────────────┼───────────────────────────────────────┘
                          │ HTTPS
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                    VERCEL EDGE NETWORK                          │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                    CDN + Edge Cache                      │   │
│  │              (Static assets, ISR pages)                  │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                    NEXT.JS 16 APPLICATION                       │
│                                                                  │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │                    APP ROUTER (RSC)                        │ │
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐         │ │
│  │  │   Pages     │ │   Layouts   │ │   Loading   │         │ │
│  │  │  (routes)   │ │  (shared)   │ │  (suspense) │         │ │
│  │  └─────────────┘ └─────────────┘ └─────────────┘         │ │
│  └───────────────────────────────────────────────────────────┘ │
│                                                                  │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │                    SERVER ACTIONS                          │ │
│  │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐         │ │
│  │  │  Auth   │ │ Invoice │ │ Client  │ │ Payment │         │ │
│  │  │ Actions │ │ Actions │ │ Actions │ │ Actions │         │ │
│  │  └─────────┘ └─────────┘ └─────────┘ └─────────┘         │ │
│  └───────────────────────────────────────────────────────────┘ │
│                                                                  │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │                    API ROUTES (/api)                       │ │
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐         │ │
│  │  │   Webhooks  │ │   Figma     │ │    PDF      │         │ │
│  │  │  (Stripe)   │ │   Import    │ │  Generate   │         │ │
│  │  └─────────────┘ └─────────────┘ └─────────────┘         │ │
│  └───────────────────────────────────────────────────────────┘ │
│                                                                  │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │                    BUSINESS LOGIC                          │ │
│  │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐         │ │
│  │  │ Invoice │ │ Template│ │ Payment │ │ Notif   │         │ │
│  │  │ Service │ │ Parser  │ │ Service │ │ Service │         │ │
│  │  └─────────┘ └─────────┘ └─────────┘ └─────────┘         │ │
│  └───────────────────────────────────────────────────────────┘ │
│                                                                  │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │                    DATA ACCESS LAYER                       │ │
│  │  ┌─────────────────────────────────────────────────────┐  │ │
│  │  │              DRIZZLE ORM (Type-safe)                │  │ │
│  │  │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐   │  │ │
│  │  │  │  User   │ │ Invoice │ │ Client  │ │Template │   │  │ │
│  │  │  │  Repo   │ │  Repo   │ │  Repo   │ │  Repo   │   │  │ │
│  │  │  └─────────┘ └─────────┘ └─────────┘ └─────────┘   │  │ │
│  │  └─────────────────────────────────────────────────────┘  │ │
│  └───────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                          │
          ┌───────────────┼───────────────┐
          │               │               │
          ▼               ▼               ▼
┌─────────────────┐ ┌───────────┐ ┌───────────────┐
│  NEON POSTGRES  │ │   BLOB    │ │  EXTERNAL     │
│                 │ │  STORAGE  │ │  SERVICES     │
│  ┌───────────┐  │ │           │ │               │
│  │  Tables   │  │ │  - PDFs   │ │  - Figma API  │
│  │  Indexes  │  │ │  - Logos  │ │  - Stripe     │
│  │  Views    │  │ │  - Assets │ │  - Resend     │
│  └───────────┘  │ │           │ │               │
└─────────────────┘ └───────────┘ └───────────────┘
```

### Rationale

**Pourquoi Monolithe Modulaire ?**
- **Simplicité** : Un seul déploiement, debugging facile
- **Performance** : Pas de latence réseau entre services
- **Productivité** : Développeur solo, itérations rapides
- **Évolution** : Peut être découpé en microservices plus tard si nécessaire

**Pourquoi pas Microservices ?**
- Overkill pour Level 2 (27-41 stories)
- Complexité opérationnelle non justifiée
- Budget limité (infrastructure plus coûteuse)

---

## 4. Technology Stack

### Frontend

| Technologie | Version | Justification |
|-------------|---------|---------------|
| **Next.js** | 16.x | App Router, RSC, Server Actions, performance optimale |
| **React** | 19.x | Concurrent features, Suspense, use() hook |
| **TypeScript** | 5.x | Type safety, DX, refactoring sûr |
| **Tailwind CSS** | 4.x | Utility-first, responsive design rapide |
| **shadcn/ui** | Latest | Composants accessibles, personnalisables |
| **React Hook Form** | 7.x | Formulaires performants |
| **Zod** | 3.x | Validation schéma, intégration TypeScript |
| **TanStack Query** | 5.x | Data fetching, caching, mutations |

### Backend

| Technologie | Version | Justification |
|-------------|---------|---------------|
| **Next.js API Routes** | 16.x | Intégré, pas de serveur séparé |
| **Server Actions** | Built-in | Mutations type-safe, progressive enhancement |
| **Drizzle ORM** | 0.31+ | Type-safe, léger, migrations, serverless |
| **Auth.js** | 5.x | OAuth providers, sessions, adapters |

### Database

| Technologie | Provider | Justification |
|-------------|----------|---------------|
| **PostgreSQL** | Neon | Serverless, branching, free tier généreux |
| **Drizzle-kit** | - | Migrations, introspection |

### Services Externes

| Service | Usage | Justification |
|---------|-------|---------------|
| **Figma API** | Import designs, OAuth | Core feature |
| **Stripe** | Paiements, webhooks | Standard industrie, hosted checkout |
| **Resend** | Emails transactionnels | DX moderne, React Email |
| **Vercel Blob** | Stockage fichiers | Intégré, CDN automatique |

### Infrastructure

| Technologie | Usage | Justification |
|-------------|-------|---------------|
| **Vercel** | Hosting, Edge, Serverless | Intégration Next.js native |
| **Vercel Analytics** | Performance monitoring | Built-in, RUM |
| **Sentry** | Error tracking | Industry standard |

### Development

| Outil | Usage |
|-------|-------|
| **pnpm** | Package manager (rapide, efficace) |
| **ESLint** | Linting |
| **Prettier** | Formatting |
| **Vitest** | Unit testing |
| **Playwright** | E2E testing |
| **GitHub Actions** | CI/CD |

---

## 5. System Components

### Component 1: Authentication Module

**Purpose:** Gérer l'authentification et les sessions utilisateur

**Responsibilities:**
- OAuth flow avec Figma
- Gestion des sessions (JWT)
- Refresh token handling
- Logout et révocation

**Interfaces:**
- `signIn()` - Server Action
- `signOut()` - Server Action
- `getSession()` - Utility
- `/api/auth/[...nextauth]` - Auth.js routes

**Dependencies:**
- Auth.js
- Figma OAuth Provider
- Neon (sessions storage)

**FRs Addressed:** FR-001

---

### Component 2: User Profile Module

**Purpose:** Gérer les profils utilisateurs et informations business

**Responsibilities:**
- CRUD profil utilisateur
- Upload et stockage logo/avatar
- Validation SIRET/SIREN
- Gestion informations bancaires (chiffrées)

**Interfaces:**
- `updateProfile()` - Server Action
- `uploadLogo()` - Server Action
- `getProfile()` - Server Action

**Dependencies:**
- Drizzle ORM
- Vercel Blob (images)
- Crypto (chiffrement IBAN)

**FRs Addressed:** FR-002

---

### Component 3: Figma Integration Module

**Purpose:** Importer et parser les designs Figma

**Responsibilities:**
- Validation URL Figma
- Appel API Figma (GET file/nodes)
- Parsing structure du design
- Extraction styles (couleurs, fonts, positions)
- Stockage template parsé

**Interfaces:**
- `importFigmaDesign(url)` - Server Action
- `parseFigmaNode(node)` - Internal
- `/api/figma/import` - API Route

**Dependencies:**
- Figma REST API
- User OAuth token (stored encrypted)

**FRs Addressed:** FR-003, FR-004

---

### Component 4: Invoice Editor Module

**Purpose:** Interface d'édition et mapping des variables

**Responsibilities:**
- Rendu du canvas avec le design
- Sélection d'éléments
- Mapping variables → éléments
- Modification styles (Could Have)
- Preview temps réel

**Interfaces:**
- React Components (Canvas, PropertyPanel, VariableMapper)
- `saveMapping()` - Server Action
- `updateElementStyle()` - Server Action

**Dependencies:**
- Template Parser output
- Invoice data (for preview)

**FRs Addressed:** FR-005, FR-006, FR-007

---

### Component 5: Invoice Management Module

**Purpose:** CRUD complet des factures

**Responsibilities:**
- Création de facture
- Gestion des lignes de service
- Calcul automatique (totaux, TVA)
- Gestion des statuts (state machine)
- Recherche et filtrage
- Duplication

**Interfaces:**
- `createInvoice()` - Server Action
- `updateInvoice()` - Server Action
- `deleteInvoice()` - Server Action
- `duplicateInvoice()` - Server Action
- `updateInvoiceStatus()` - Server Action

**Dependencies:**
- Drizzle ORM
- Template Module
- Client Module

**FRs Addressed:** FR-008, FR-009, FR-010, FR-011

---

### Component 6: Client Management Module

**Purpose:** Gérer la base de données clients

**Responsibilities:**
- CRUD clients
- Validation données (email, SIRET)
- Association factures
- Recherche clients

**Interfaces:**
- `createClient()` - Server Action
- `updateClient()` - Server Action
- `deleteClient()` - Server Action
- `searchClients()` - Server Action

**Dependencies:**
- Drizzle ORM

**FRs Addressed:** FR-012

---

### Component 7: Payment Link Module

**Purpose:** Générer et gérer les liens de paiement

**Responsibilities:**
- Génération token unique sécurisé
- Configuration expiration
- Page publique (non authentifiée)
- Validation token
- Affichage facture

**Interfaces:**
- `generatePaymentLink()` - Server Action
- `/pay/[token]` - Public page
- `validateToken()` - Internal

**Dependencies:**
- Invoice Module
- Crypto (token generation)

**FRs Addressed:** FR-013

---

### Component 8: Stripe Integration Module

**Purpose:** Gérer les paiements via Stripe

**Responsibilities:**
- Création Stripe Checkout Session
- Webhooks handling (payment success, failure)
- Paiement partiel (acomptes)
- Mise à jour statut facture

**Interfaces:**
- `createCheckoutSession()` - Server Action
- `/api/webhooks/stripe` - Webhook endpoint
- `handlePaymentSuccess()` - Internal

**Dependencies:**
- Stripe SDK
- Invoice Module (status updates)
- Notification Module

**FRs Addressed:** FR-014, FR-015

---

### Component 9: PDF Generation Module

**Purpose:** Générer des PDFs fidèles au design

**Responsibilities:**
- Rendu design avec données
- Génération PDF serveur
- Optimisation taille fichier
- Stockage temporaire

**Interfaces:**
- `generatePDF(invoiceId)` - Server Action
- `/api/pdf/[invoiceId]` - Download endpoint

**Dependencies:**
- @react-pdf/renderer
- Template data
- Invoice data

**FRs Addressed:** FR-016

---

### Component 10: Notification Module

**Purpose:** Envoyer emails et notifications

**Responsibilities:**
- Templates email (React Email)
- Envoi via Resend
- Emails transactionnels (facture envoyée, paiement reçu)
- Rappels automatiques (CRON)
- Logs d'envoi

**Interfaces:**
- `sendInvoiceEmail()` - Server Action
- `sendPaymentConfirmation()` - Internal
- `/api/cron/reminders` - CRON endpoint

**Dependencies:**
- Resend SDK
- React Email templates

**FRs Addressed:** FR-017, FR-018

---

## 6. Data Architecture

### Entity Relationship Diagram

```
┌─────────────────┐       ┌─────────────────┐
│      USER       │       │     CLIENT      │
├─────────────────┤       ├─────────────────┤
│ id (PK)         │       │ id (PK)         │
│ figma_id        │       │ user_id (FK)    │──┐
│ email           │       │ company_name    │  │
│ name            │       │ contact_name    │  │
│ avatar_url      │       │ contact_email   │  │
│ phone           │       │ phone           │  │
│ address         │       │ address         │  │
│ siret           │       │ siret           │  │
│ siren           │       │ siren           │  │
│ logo_url        │       │ created_at      │  │
│ iban_encrypted  │       │ updated_at      │  │
│ bic             │       │ deleted_at      │  │
│ bank_name       │       └────────┬────────┘  │
│ bank_address    │                │           │
│ terms_template  │                │           │
│ created_at      │                │           │
│ updated_at      │                │           │
└────────┬────────┘                │           │
         │                         │           │
         │ 1:N                     │           │
         ▼                         │           │
┌─────────────────┐                │           │
│    TEMPLATE     │                │           │
├─────────────────┤                │           │
│ id (PK)         │                │           │
│ user_id (FK)    │◄───────────────┘           │
│ name            │                             │
│ figma_file_key  │                             │
│ figma_node_id   │                             │
│ figma_data (JSON)│ ◄── Structure parsée       │
│ mappings (JSON) │ ◄── Variable mappings       │
│ styles (JSON)   │ ◄── Style overrides         │
│ thumbnail_url   │                             │
│ created_at      │                             │
│ updated_at      │                             │
└────────┬────────┘                             │
         │                                      │
         │ 1:N                                  │
         ▼                                      │
┌─────────────────┐                             │
│    INVOICE      │                             │
├─────────────────┤                             │
│ id (PK)         │                             │
│ user_id (FK)    │◄────────────────────────────┘
│ client_id (FK)  │◄────────────────────────────┐
│ template_id (FK)│                             │
│ number          │ ◄── Unique per user         │
│ status          │ ◄── ENUM                    │
│ issue_date      │                             │
│ due_date        │                             │
│ subtotal        │                             │
│ tax_rate        │                             │
│ tax_amount      │                             │
│ total           │                             │
│ currency        │                             │
│ notes           │                             │
│ payment_token   │ ◄── Unique, secure          │
│ token_expires_at│                             │
│ allow_partial   │                             │
│ paid_amount     │                             │
│ pdf_url         │                             │
│ created_at      │                             │
│ updated_at      │                             │
│ sent_at         │                             │
│ paid_at         │                             │
└────────┬────────┘
         │
         │ 1:N
         ▼
┌─────────────────┐
│ INVOICE_ITEM    │
├─────────────────┤
│ id (PK)         │
│ invoice_id (FK) │
│ name            │
│ description     │
│ quantity        │
│ unit_price      │
│ total           │
│ order           │
│ created_at      │
└─────────────────┘

┌─────────────────┐
│    PAYMENT      │
├─────────────────┤
│ id (PK)         │
│ invoice_id (FK) │
│ stripe_payment_id│
│ amount          │
│ status          │
│ paid_at         │
│ created_at      │
└─────────────────┘

┌─────────────────┐
│   EMAIL_LOG     │
├─────────────────┤
│ id (PK)         │
│ user_id (FK)    │
│ invoice_id (FK) │
│ type            │
│ recipient       │
│ status          │
│ sent_at         │
│ opened_at       │
└─────────────────┘

┌─────────────────┐
│   AUDIT_LOG     │
├─────────────────┤
│ id (PK)         │
│ user_id (FK)    │
│ action          │
│ entity_type     │
│ entity_id       │
│ old_data (JSON) │
│ new_data (JSON) │
│ ip_address      │
│ user_agent      │
│ created_at      │
└─────────────────┘
```

### Invoice Status State Machine

```
                    ┌──────────┐
                    │ BROUILLON│
                    └────┬─────┘
                         │ [Envoyer]
                         ▼
                    ┌──────────┐
           ┌────────│ ENVOYÉE  │────────┐
           │        └────┬─────┘        │
           │             │              │
    [Paiement      [Paiement      [Date échéance
     partiel]       complet]        dépassée]
           │             │              │
           ▼             ▼              ▼
    ┌──────────┐   ┌──────────┐   ┌──────────┐
    │PARTIELLEMENT│ │  PAYÉE   │   │EN RETARD │
    │   PAYÉE    │ └──────────┘   └────┬─────┘
    └─────┬──────┘                     │
          │                     [Paiement complet]
    [Paiement                          │
     complet]                          │
          │                            │
          └────────────┬───────────────┘
                       ▼
                  ┌──────────┐
                  │  PAYÉE   │
                  └──────────┘

    [À tout moment depuis ENVOYÉE/EN RETARD]
                       │
           ┌───────────┴───────────┐
           ▼                       ▼
    ┌──────────┐            ┌──────────┐
    │  LITIGE  │            │ ANNULÉE  │
    └──────────┘            └──────────┘
```

### Drizzle Schema (Excerpt)

```typescript
// schema/users.ts
import { pgTable, text, timestamp, varchar } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  figmaId: varchar('figma_id', { length: 255 }).unique().notNull(),
  email: varchar('email', { length: 255 }).unique().notNull(),
  name: varchar('name', { length: 255 }),
  avatarUrl: text('avatar_url'),
  phone: varchar('phone', { length: 50 }),
  address: text('address'),
  siret: varchar('siret', { length: 14 }),
  siren: varchar('siren', { length: 9 }),
  logoUrl: text('logo_url'),
  ibanEncrypted: text('iban_encrypted'),
  bic: varchar('bic', { length: 11 }),
  bankName: varchar('bank_name', { length: 255 }),
  bankAddress: text('bank_address'),
  termsTemplate: text('terms_template'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// schema/invoices.ts
export const invoiceStatusEnum = pgEnum('invoice_status', [
  'draft',
  'sent',
  'paid',
  'overdue',
  'partially_paid',
  'disputed',
  'cancelled'
]);

export const invoices = pgTable('invoices', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id').notNull().references(() => users.id),
  clientId: text('client_id').notNull().references(() => clients.id),
  templateId: text('template_id').references(() => templates.id),
  number: varchar('number', { length: 50 }).notNull(),
  status: invoiceStatusEnum('status').default('draft').notNull(),
  issueDate: timestamp('issue_date').notNull(),
  dueDate: timestamp('due_date').notNull(),
  subtotal: integer('subtotal').notNull(), // cents
  taxRate: integer('tax_rate').default(2000).notNull(), // basis points (20.00%)
  taxAmount: integer('tax_amount').notNull(), // cents
  total: integer('total').notNull(), // cents
  currency: varchar('currency', { length: 3 }).default('EUR').notNull(),
  notes: text('notes'),
  paymentToken: varchar('payment_token', { length: 64 }).unique(),
  tokenExpiresAt: timestamp('token_expires_at'),
  allowPartial: boolean('allow_partial').default(false),
  paidAmount: integer('paid_amount').default(0).notNull(), // cents
  pdfUrl: text('pdf_url'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  sentAt: timestamp('sent_at'),
  paidAt: timestamp('paid_at'),
}, (table) => ({
  userNumberIdx: uniqueIndex('user_number_idx').on(table.userId, table.number),
  statusIdx: index('status_idx').on(table.status),
  dueDateIdx: index('due_date_idx').on(table.dueDate),
}));
```

---

## 7. API Design

### Architecture API

| Aspect | Choix | Justification |
|--------|-------|---------------|
| **Style** | REST + Server Actions | Server Actions pour mutations, REST pour webhooks/public |
| **Format** | JSON | Standard web |
| **Auth** | JWT (sessions) | Auth.js sessions |
| **Versioning** | URL prefix (/api/v1/) | Explicit, backward compatible |

### Server Actions (Mutations)

Les Server Actions sont privilégiées pour les mutations authentifiées :

```typescript
// actions/invoices.ts
'use server'

import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { invoices, invoiceItems } from '@/schema'
import { revalidatePath } from 'next/cache'

export async function createInvoice(data: CreateInvoiceInput) {
  const session = await auth()
  if (!session?.user) throw new Error('Unauthorized')

  // Validation with Zod
  const validated = createInvoiceSchema.parse(data)

  // Create invoice
  const [invoice] = await db.insert(invoices).values({
    userId: session.user.id,
    ...validated,
  }).returning()

  revalidatePath('/dashboard/invoices')
  return invoice
}
```

### API Routes (Public/Webhooks)

```
/api/v1/
├── auth/
│   └── [...nextauth]/          # Auth.js handlers
├── webhooks/
│   └── stripe/                 # POST - Stripe webhooks
├── figma/
│   └── import/                 # POST - Import design (authenticated)
├── pdf/
│   └── [invoiceId]/            # GET - Download PDF
├── pay/
│   └── [token]/
│       ├── GET                 # Get invoice data (public)
│       └── checkout/           # POST - Create Stripe session
└── cron/
    └── reminders/              # POST - Send reminder emails (Vercel CRON)
```

### Key Endpoints Detail

#### POST /api/webhooks/stripe
```typescript
// Webhook pour Stripe events
{
  // Headers
  "stripe-signature": "t=...,v1=..."
}
// Body: Stripe Event object

// Response: 200 OK ou 400 Bad Request
```

#### GET /api/pay/[token]
```typescript
// Public endpoint - pas d'auth requise
// Response:
{
  "invoice": {
    "number": "F-2026-001",
    "issueDate": "2026-01-18",
    "dueDate": "2026-02-17",
    "total": 35490, // cents
    "paidAmount": 0,
    "allowPartial": true,
    "status": "sent"
  },
  "sender": {
    "name": "Salah-Eddine Sriar",
    "avatarUrl": "...",
    "message": "Merci pour votre confiance..."
  },
  "renderedDesign": "..." // HTML or image URL
}
```

#### POST /api/pay/[token]/checkout
```typescript
// Create Stripe Checkout session
// Body:
{
  "amount": 35490 // Optional for partial payment
}

// Response:
{
  "checkoutUrl": "https://checkout.stripe.com/..."
}
```

---

## 8. Security Architecture

### Authentication Flow

```
┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
│  Client  │────▶│ Next.js  │────▶│  Figma   │────▶│   Neon   │
│ (Browser)│     │ (Auth.js)│     │  OAuth   │     │(Sessions)│
└──────────┘     └──────────┘     └──────────┘     └──────────┘
     │                │                │                │
     │ 1. Click       │                │                │
     │   "Login"      │                │                │
     │───────────────▶│                │                │
     │                │                │                │
     │ 2. Redirect    │                │                │
     │◀───────────────│                │                │
     │                │                │                │
     │ 3. Auth at     │                │                │
     │    Figma       │                │                │
     │───────────────────────────────▶│                │
     │                │                │                │
     │ 4. Callback    │                │                │
     │   with code    │                │                │
     │◀──────────────────────────────│                │
     │                │                │                │
     │ 5. Exchange    │                │                │
     │───────────────▶│──────────────▶│                │
     │                │                │                │
     │                │ 6. Get tokens  │                │
     │                │◀──────────────│                │
     │                │                │                │
     │                │ 7. Create/Update user          │
     │                │ 8. Create session              │
     │                │───────────────────────────────▶│
     │                │                │                │
     │ 9. Set cookie  │                │                │
     │◀───────────────│                │                │
     │                │                │                │
```

### Authorization Model

**RBAC simplifié (MVP):**
- Un seul rôle : `user`
- Chaque utilisateur accède uniquement à ses propres données
- Vérification systématique : `WHERE user_id = session.user.id`

```typescript
// lib/auth.ts
export async function requireAuth() {
  const session = await auth()
  if (!session?.user) {
    redirect('/login')
  }
  return session.user
}

// Dans les Server Actions
export async function getInvoice(id: string) {
  const user = await requireAuth()

  const invoice = await db.query.invoices.findFirst({
    where: and(
      eq(invoices.id, id),
      eq(invoices.userId, user.id) // ← Authorization
    )
  })

  if (!invoice) throw new Error('Not found')
  return invoice
}
```

### Data Encryption

| Donnée | Méthode | Stockage |
|--------|---------|----------|
| **Tokens Figma** | AES-256-GCM | DB (encrypted column) |
| **IBAN** | AES-256-GCM | DB (encrypted column) |
| **Passwords** | N/A (OAuth only) | - |
| **Sessions** | JWT | Cookie (HttpOnly, Secure) |
| **DB at rest** | Transparent encryption | Neon managed |
| **Transit** | TLS 1.3 | All connections |

```typescript
// lib/encryption.ts
import { createCipheriv, createDecipheriv, randomBytes } from 'crypto'

const ALGORITHM = 'aes-256-gcm'
const KEY = Buffer.from(process.env.ENCRYPTION_KEY!, 'hex')

export function encrypt(text: string): string {
  const iv = randomBytes(16)
  const cipher = createCipheriv(ALGORITHM, KEY, iv)

  let encrypted = cipher.update(text, 'utf8', 'hex')
  encrypted += cipher.final('hex')

  const authTag = cipher.getAuthTag()

  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`
}

export function decrypt(encryptedText: string): string {
  const [ivHex, authTagHex, encrypted] = encryptedText.split(':')

  const iv = Buffer.from(ivHex, 'hex')
  const authTag = Buffer.from(authTagHex, 'hex')
  const decipher = createDecipheriv(ALGORITHM, KEY, iv)
  decipher.setAuthTag(authTag)

  let decrypted = decipher.update(encrypted, 'hex', 'utf8')
  decrypted += decipher.final('utf8')

  return decrypted
}
```

### Security Best Practices

| Pratique | Implementation |
|----------|----------------|
| **Input Validation** | Zod schemas sur toutes les entrées |
| **SQL Injection** | Drizzle ORM (parameterized queries) |
| **XSS** | React (auto-escaping), CSP headers |
| **CSRF** | SameSite cookies, Server Actions |
| **Rate Limiting** | Vercel Edge middleware |
| **Security Headers** | next.config.js headers |

```typescript
// middleware.ts
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(100, '1 m'), // 100 req/min
})

export async function middleware(request: NextRequest) {
  const ip = request.ip ?? '127.0.0.1'
  const { success, limit, remaining } = await ratelimit.limit(ip)

  if (!success) {
    return new Response('Too Many Requests', { status: 429 })
  }

  return NextResponse.next()
}
```

---

## 9. Performance & Scalability

### Caching Strategy

```
┌─────────────────────────────────────────────────────────────────┐
│                        CACHE LAYERS                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Layer 1: BROWSER CACHE                                        │
│  ├── Static assets (JS, CSS, images) - 1 year                  │
│  └── Immutable hashed filenames                                │
│                                                                 │
│  Layer 2: CDN EDGE CACHE (Vercel)                              │
│  ├── Static pages (public) - ISR                               │
│  ├── API responses - s-maxage headers                          │
│  └── Images via next/image                                      │
│                                                                 │
│  Layer 3: APPLICATION CACHE                                    │
│  ├── React Query - client-side data cache                      │
│  ├── Next.js fetch cache - server-side                         │
│  └── unstable_cache for expensive operations                   │
│                                                                 │
│  Layer 4: DATABASE QUERY CACHE                                  │
│  └── Neon connection pooling (pgBouncer)                       │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Cache Implementation

```typescript
// Expensive operation caching
import { unstable_cache } from 'next/cache'

export const getInvoiceStats = unstable_cache(
  async (userId: string) => {
    return db.select({
      total: count(),
      paid: count(sql`CASE WHEN status = 'paid' THEN 1 END`),
      pending: count(sql`CASE WHEN status = 'sent' THEN 1 END`),
    })
    .from(invoices)
    .where(eq(invoices.userId, userId))
  },
  ['invoice-stats'],
  {
    revalidate: 60, // 1 minute
    tags: ['invoices'],
  }
)

// Invalidation on mutation
export async function createInvoice(data: CreateInvoiceInput) {
  // ... create invoice
  revalidateTag('invoices')
}
```

### Scaling Strategy

**Vertical scaling (MVP):**
- Vercel Pro avec plus de ressources
- Neon compute scaling automatique

**Horizontal scaling (futur):**
- Vercel serverless auto-scale
- Neon read replicas si nécessaire
- CDN pour assets statiques

### Performance Targets

| Métrique | Cible | Mesure |
|----------|-------|--------|
| **LCP** | < 2.5s | Vercel Analytics |
| **FID** | < 100ms | Vercel Analytics |
| **CLS** | < 0.1 | Vercel Analytics |
| **TTFB** | < 200ms | Synthetic monitoring |
| **API p95** | < 500ms | Custom metrics |

---

## 10. Reliability & Monitoring

### Monitoring Stack

```
┌─────────────────────────────────────────────────────────────────┐
│                      OBSERVABILITY                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  METRICS (Vercel Analytics)                                    │
│  ├── Web Vitals (LCP, FID, CLS)                                │
│  ├── Request latency                                            │
│  └── Traffic patterns                                           │
│                                                                 │
│  ERRORS (Sentry)                                                │
│  ├── Uncaught exceptions                                        │
│  ├── Rejected promises                                          │
│  ├── API errors                                                 │
│  └── Source maps for stack traces                               │
│                                                                 │
│  LOGS (Vercel Logs)                                             │
│  ├── Request logs                                               │
│  ├── Build logs                                                 │
│  └── Function logs                                              │
│                                                                 │
│  UPTIME (Better Uptime / Checkly)                               │
│  ├── Synthetic checks every 1 min                               │
│  └── Alert on downtime                                          │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Alerting Rules

| Alert | Condition | Channel |
|-------|-----------|---------|
| **Site Down** | 2 failed checks | Email, Slack |
| **Error Spike** | >10 errors/min | Sentry notification |
| **Slow Response** | p95 > 2s | Email |
| **Payment Failed** | Stripe webhook error | Email |

### Backup Strategy

| Data | Frequency | Retention | Method |
|------|-----------|-----------|--------|
| **Database** | Continuous | 7 days | Neon Point-in-Time Recovery |
| **Blob Storage** | N/A | Indefinite | Vercel Blob (durable) |
| **Code** | Per commit | Indefinite | GitHub |

---

## 11. Development & Deployment

### Project Structure

```
figmainvoice/
├── app/                        # Next.js App Router
│   ├── (auth)/                 # Auth layout group
│   │   ├── login/
│   │   └── callback/
│   ├── (dashboard)/            # Dashboard layout group
│   │   ├── layout.tsx
│   │   ├── page.tsx            # Dashboard home
│   │   ├── invoices/
│   │   │   ├── page.tsx        # Invoice list
│   │   │   ├── [id]/
│   │   │   │   ├── page.tsx    # Invoice detail
│   │   │   │   └── edit/
│   │   │   └── new/
│   │   ├── clients/
│   │   ├── templates/
│   │   └── settings/
│   ├── pay/
│   │   └── [token]/            # Public payment page
│   │       └── page.tsx
│   ├── api/
│   │   ├── auth/
│   │   ├── webhooks/
│   │   ├── pdf/
│   │   └── cron/
│   ├── layout.tsx
│   └── globals.css
├── components/
│   ├── ui/                     # shadcn/ui components
│   ├── forms/                  # Form components
│   ├── invoice/                # Invoice-specific components
│   │   ├── invoice-editor.tsx
│   │   ├── invoice-canvas.tsx
│   │   ├── variable-mapper.tsx
│   │   └── property-panel.tsx
│   └── layout/                 # Layout components
├── lib/
│   ├── auth.ts                 # Auth.js config
│   ├── db.ts                   # Drizzle client
│   ├── stripe.ts               # Stripe client
│   ├── resend.ts               # Resend client
│   ├── figma.ts                # Figma API client
│   ├── encryption.ts           # Encryption utilities
│   └── utils.ts                # General utilities
├── actions/                    # Server Actions
│   ├── auth.ts
│   ├── invoices.ts
│   ├── clients.ts
│   ├── templates.ts
│   └── payments.ts
├── schema/                     # Drizzle schema
│   ├── index.ts
│   ├── users.ts
│   ├── invoices.ts
│   ├── clients.ts
│   └── templates.ts
├── emails/                     # React Email templates
│   ├── invoice-sent.tsx
│   ├── payment-received.tsx
│   └── reminder.tsx
├── types/                      # TypeScript types
├── hooks/                      # Custom React hooks
├── drizzle/                    # Migrations
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
├── .env.local
├── .env.example
├── drizzle.config.ts
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

### CI/CD Pipeline

```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'
      - run: pnpm install
      - run: pnpm lint
      - run: pnpm type-check

  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'
      - run: pnpm install
      - run: pnpm test

  e2e:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'
      - run: pnpm install
      - run: pnpm exec playwright install --with-deps
      - run: pnpm test:e2e

# Deployment via Vercel GitHub integration (automatic)
```

### Environments

| Environment | URL | Purpose | Database |
|-------------|-----|---------|----------|
| **Development** | localhost:3000 | Local dev | Neon branch |
| **Preview** | *.vercel.app | PR previews | Neon branch |
| **Production** | figmainvoice.com | Live | Neon main |

---

## 12. NFR Coverage

### NFR-001: Performance - Temps de Chargement

**Requirement:** Pages < 500ms, Import Figma < 5s, PDF < 3s

**Solution:**
- Server Components pour rendu initial sans JavaScript
- Streaming avec Suspense pour contenu progressif
- Edge caching via Vercel CDN
- next/image pour optimisation images
- PDF généré en background avec notification

**Validation:**
- Vercel Analytics Web Vitals
- Synthetic monitoring (Checkly)

---

### NFR-002: Performance - Capacité

**Requirement:** 100 users simultanés, 1000 req/min

**Solution:**
- Vercel serverless auto-scaling
- Neon serverless compute scaling
- Connection pooling (pgBouncer)
- Rate limiting middleware

**Validation:**
- Load testing avec k6/Artillery

---

### NFR-003: Disponibilité

**Requirement:** 99% uptime

**Solution:**
- Vercel infrastructure (multi-region)
- Neon managed PostgreSQL (99.95% SLA)
- Health checks automatiques
- Status page publique

**Validation:**
- Uptime monitoring (Better Uptime)

---

### NFR-004: Sécurité - RGPD

**Requirement:** Conformité RGPD complète

**Solution:**
- Politique de confidentialité
- Consentement cookies (cookie banner)
- API export données (`/api/user/export`)
- API suppression compte (`/api/user/delete`)
- Registre des traitements documenté

**Validation:**
- Checklist RGPD, audit

---

### NFR-005: Sécurité - Transport et Stockage

**Requirement:** HTTPS, chiffrement DB, tokens sécurisés

**Solution:**
- HTTPS forcé via Vercel
- Neon encryption at rest
- AES-256-GCM pour IBAN/tokens
- Variables d'environnement sécurisées
- HttpOnly, Secure, SameSite cookies

**Validation:**
- Security headers test (securityheaders.com)
- SSL Labs test

---

### NFR-006: Sécurité - Audit

**Requirement:** Logs des actions sensibles

**Solution:**
- Table `audit_log` pour actions CRUD
- Middleware pour capturer IP, user agent
- Rétention 1 an
- Accès restreint (admin only - future)

**Validation:**
- Review logs structure

---

### NFR-007: Compatibilité - Navigateurs

**Requirement:** Chrome, Firefox, Safari, Edge (2 dernières versions)

**Solution:**
- Next.js transpilation automatique
- Browserslist configuration
- Polyfills automatiques

**Validation:**
- BrowserStack testing

---

### NFR-008: Compatibilité - Responsive

**Requirement:** Desktop, Tablet, Mobile

**Solution:**
- Tailwind CSS responsive classes
- Mobile-first approach
- Composants adaptatifs
- Éditeur limité sur mobile avec message

**Validation:**
- Testing sur différentes tailles d'écran

---

### NFR-009: Accessibilité

**Requirement:** WCAG 2.1 AA

**Solution:**
- shadcn/ui (composants accessibles)
- Labels ARIA
- Navigation clavier
- Contrastes suffisants
- Focus visible

**Validation:**
- axe-core automated testing
- Manual testing

---

### NFR-010: Maintenabilité

**Requirement:** Tests > 70%, documentation API

**Solution:**
- Vitest pour unit tests
- Playwright pour E2E
- TypeScript strict
- ESLint + Prettier
- README et commentaires

**Validation:**
- Coverage reports
- Code review obligatoire

---

## 13. Traceability

### FR → Components

| FR | Components | Notes |
|----|------------|-------|
| FR-001 | Auth Module | OAuth Figma |
| FR-002 | User Profile Module | CRUD profile |
| FR-003 | Figma Integration Module | URL import |
| FR-004 | Figma Integration Module | Parsing |
| FR-005 | Invoice Editor Module | Variable mapping |
| FR-006 | Invoice Editor Module | Style editing |
| FR-007 | Invoice Editor Module | Repositioning |
| FR-008 | Invoice Management Module | Create invoice |
| FR-009 | Invoice Management Module | Status management |
| FR-010 | Invoice Management Module | List & search |
| FR-011 | Invoice Management Module | Duplication |
| FR-012 | Client Management Module | CRUD clients |
| FR-013 | Payment Link Module | Generate link |
| FR-014 | Stripe Integration Module | Checkout |
| FR-015 | Stripe Integration Module | Partial payment |
| FR-016 | PDF Generation Module | Generate PDF |
| FR-017 | Notification Module | Send email |
| FR-018 | Notification Module | Auto notifications |

### NFR → Architecture Solutions

| NFR | Solution |
|-----|----------|
| NFR-001 | RSC, Streaming, Edge cache, CDN |
| NFR-002 | Serverless, Connection pooling |
| NFR-003 | Vercel/Neon managed infra |
| NFR-004 | Export/Delete APIs, Privacy policy |
| NFR-005 | TLS, AES-256, Secure cookies |
| NFR-006 | Audit log table, Middleware |
| NFR-007 | Next.js transpilation |
| NFR-008 | Tailwind responsive |
| NFR-009 | shadcn/ui, ARIA |
| NFR-010 | TypeScript, Testing, CI/CD |

---

## 14. Trade-offs & Decisions

### Decision 1: Monolithe vs Microservices

**Choix :** Monolithe Modulaire

**Trade-offs :**
- **Gain :** Simplicité déploiement, pas de latence réseau, debugging facile
- **Perte :** Scaling indépendant impossible, couplage plus fort

**Rationale :** Pour un projet Level 2 avec développeur solo, la complexité des microservices n'est pas justifiée.

---

### Decision 2: Server Actions vs API Routes

**Choix :** Server Actions pour mutations, API Routes pour webhooks/public

**Trade-offs :**
- **Gain :** Type safety end-to-end, progressive enhancement, moins de boilerplate
- **Perte :** Debugging plus complexe, logs moins visibles

**Rationale :** Server Actions sont le pattern recommandé par Next.js pour les mutations authentifiées.

---

### Decision 3: Drizzle vs Prisma

**Choix :** Drizzle ORM

**Trade-offs :**
- **Gain :** Plus léger (~7kb), SQL-like API, meilleur pour serverless
- **Perte :** Écosystème plus petit, moins de documentation

**Rationale :** Drizzle est optimisé pour les environnements serverless comme Vercel.

---

### Decision 4: Neon vs Supabase

**Choix :** Neon PostgreSQL

**Trade-offs :**
- **Gain :** Serverless natif, branching pour previews, free tier généreux
- **Perte :** Pas de storage/auth intégrés (utilisation d'autres services)

**Rationale :** Auth.js + Vercel Blob sont préférés pour plus de contrôle.

---

### Decision 5: @react-pdf/renderer vs Puppeteer

**Choix :** @react-pdf/renderer

**Trade-offs :**
- **Gain :** Native React, pas de browser headless, plus léger
- **Perte :** Rendu CSS limité, pas de support complet web

**Rationale :** Suffisant pour les factures, évite la complexité de Puppeteer en serverless.

---

## Appendix

### Glossaire

| Terme | Définition |
|-------|------------|
| **RSC** | React Server Components |
| **ISR** | Incremental Static Regeneration |
| **TTFB** | Time To First Byte |
| **LCP** | Largest Contentful Paint |
| **pgBouncer** | PostgreSQL connection pooler |

### Documents Connexes

| Document | Lien |
|----------|------|
| PRD | [prd-figmainvoice-2026-01-18.md](./prd-figmainvoice-2026-01-18.md) |
| Product Brief | [product-brief-figmainvoice-2026-01-18.md](./product-brief-figmainvoice-2026-01-18.md) |
| Figma Design Analysis | [figma-design-analysis.md](./figma-design-analysis.md) |

### Changelog

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-01-18 | Initial Architecture |

---

*Document généré via BMAD Method v6*
*Prochaine étape recommandée: /sprint-planning*
