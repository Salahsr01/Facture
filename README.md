# FigmaInvoice

Application de facturation design-first pour freelances avec intégration Figma.

Importez vos designs de facture depuis Figma, mappez les variables dynamiques, et générez des factures professionnelles en quelques clics.

## Fonctionnalités

- **Authentification Figma** - Connexion OAuth avec votre compte Figma
- **Import de designs** - Importez vos templates de facture depuis Figma via URL
- **Éditeur visuel** - Canvas interactif pour mapper les variables aux éléments du design
- **Mode preview** - Prévisualisez votre facture avec des données de test
- **Gestion des factures** - Créez, éditez et suivez vos factures
- **Gestion des clients** - Base de données clients avec historique
- **Calculs automatiques** - TVA, sous-totaux et totaux calculés en temps réel
- **Paiement Stripe** - Acceptez les paiements par carte bancaire (à venir)
- **Génération PDF** - Exportez vos factures en PDF (à venir)

## Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
- **Langage**: TypeScript (strict mode)
- **Base de données**: [Neon PostgreSQL](https://neon.tech/) + [Drizzle ORM](https://orm.drizzle.team/)
- **Authentification**: [Auth.js v5](https://authjs.dev/) (OAuth Figma)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/)
- **Paiements**: [Stripe](https://stripe.com/)
- **Emails**: [Resend](https://resend.com/) + [React Email](https://react.email/)
- **Validation**: [Zod](https://zod.dev/)
- **Déploiement**: [Vercel](https://vercel.com/)

## Prérequis

- Node.js 18+
- Compte Figma Developer
- Compte Neon (base de données)
- Compte Stripe (paiements)
- Compte Resend (emails)

## Installation

```bash
# Cloner le repository
git clone https://github.com/Salahsr01/Facture.git
cd Facture

# Installer les dépendances
npm install

# Copier les variables d'environnement
cp .env.example .env.local

# Configurer les variables (voir section Configuration)

# Initialiser la base de données
npm run db:push

# Lancer en développement
npm run dev
```

## Configuration

Créez un fichier `.env.local` avec les variables suivantes :

```env
# Base de données
DATABASE_URL="postgresql://..."

# Auth.js
AUTH_SECRET="votre-secret-aleatoire"

# Figma OAuth
FIGMA_CLIENT_ID="votre-client-id"
FIGMA_CLIENT_SECRET="votre-client-secret"

# Stripe
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."

# Resend
RESEND_API_KEY="re_..."

# URL de l'application
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

## Scripts

```bash
npm run dev          # Serveur de développement
npm run build        # Build de production
npm run start        # Serveur de production
npm run lint         # Linting ESLint
npm run db:generate  # Générer les migrations
npm run db:migrate   # Appliquer les migrations
npm run db:push      # Push le schéma (dev)
npm run db:studio    # Interface Drizzle Studio
```

## Structure du projet

```
src/
├── app/                    # Routes Next.js (App Router)
│   ├── (dashboard)/        # Routes protégées
│   │   ├── clients/        # Gestion des clients
│   │   ├── invoices/       # Gestion des factures
│   │   ├── templates/      # Éditeur de templates
│   │   └── settings/       # Paramètres utilisateur
│   ├── api/                # Routes API
│   └── login/              # Page de connexion
├── components/
│   ├── editor/             # Composants de l'éditeur
│   ├── forms/              # Formulaires
│   ├── layout/             # Header, Sidebar
│   └── ui/                 # Composants UI (shadcn)
├── lib/
│   ├── auth/               # Configuration Auth.js
│   ├── db/                 # Schéma Drizzle
│   ├── figma/              # API Figma
│   └── utils/              # Utilitaires
└── types/                  # Types TypeScript
```

## Méthodologie BMAD

Ce projet a été développé en suivant la [méthode BMAD](https://github.com/bmad-method/bmad-method) :

- **Phase 1**: Product Brief
- **Phase 2**: PRD (Product Requirements Document)
- **Phase 3**: Architecture
- **Phase 4**: Sprint Planning & Development

### Progression

| Sprint | Stories | Points | Status |
|--------|---------|--------|--------|
| Sprint 1 | 7 | 28 | Complété |
| Sprint 2 | 5 | 29 | Complété |
| Sprint 3 | 6 | 29 | Complété |
| Sprint 4 | 8 | 34 | En cours |

**Total**: 18/32 stories (86/121 points) - 71% complété

## Roadmap

- [x] Authentification OAuth Figma
- [x] Import de designs Figma
- [x] Éditeur avec mapping de variables
- [x] Mode preview avec données de test
- [x] Création de factures
- [x] Gestion des clients
- [ ] Dashboard avec statistiques
- [ ] Paiement Stripe
- [ ] Génération PDF
- [ ] Envoi par email
- [ ] Notifications automatiques

## Licence

MIT

## Auteur

Développé par [@Salahsr01](https://github.com/Salahsr01)

---

*Projet généré avec l'aide de Claude (Anthropic) via la méthode BMAD*
