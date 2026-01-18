# Product Brief: FigmaInvoice

**Version:** 1.0
**Date:** 2026-01-18
**Project Level:** 2 (Medium)
**Status:** Draft

---

## 1. Executive Summary

**FigmaInvoice** est une application web de facturation conçue pour les freelances et créatifs indépendants. Elle permet de transformer directement un design de facture créé sur Figma en une facture fonctionnelle, envoyable et payable en ligne.

**Proposition de valeur unique :**
- **Contrôle total du design** : Aucun template imposé, la facture est exactement ce que l'utilisateur a designé
- **Design Figma = Facture finale** : Le design créé sur Figma devient directement la facture envoyée au client

---

## 2. Problem Statement

### Le Problème
Les freelances (designers, développeurs, créatifs) n'ont pas accès à des solutions de facturation adaptées à leurs besoins :

1. **Logiciels trop complexes et chers** : Les ERP et logiciels de facturation traditionnels sont surdimensionnés pour un indépendant
2. **Templates génériques** : Les factures générées ne reflètent pas l'identité de marque du freelance
3. **Aucune solution design-first** : Aucun outil ne permet de partir du design pour créer la facture

### Solutions Actuelles (Workarounds)
- Excel/Google Sheets avec mise en page manuelle
- Export PDF depuis Figma sans gestion (pas de suivi, pas de paiement)
- Mélange d'outils non intégrés

### Pourquoi Maintenant ?
- Figma est devenu l'outil standard des designers et de nombreux développeurs
- La gig economy continue de croître avec de plus en plus de freelances
- Les attentes en matière de branding personnel sont élevées
- L'API Figma permet maintenant une intégration profonde

### Impact si Non Résolu
Les freelances continuent de perdre du temps sur des tâches administratives, avec des factures qui ne reflètent pas leur professionnalisme, réduisant leur crédibilité auprès des clients.

---

## 3. Target Audience

### Utilisateurs Principaux
| Segment | Description | Besoins Clés |
|---------|-------------|--------------|
| **Designers freelance** | UI/UX designers, graphistes qui utilisent Figma quotidiennement | Factures à leur image, processus rapide |
| **Développeurs freelance** | Dev qui veulent des factures professionnelles sans effort | Simplicité, automatisation |
| **Créatifs indépendants** | Photographes, vidéastes, illustrateurs | Branding cohérent, facilité d'utilisation |

### Caractéristiques Communes
- **Niveau technique :** Maîtrisent Figma au quotidien
- **Taille :** Travailleurs indépendants sans structure comptable lourde
- **Fréquence :** Facturent régulièrement des clients récurrents
- **Valeur :** Le design et le branding sont importants pour leur image professionnelle

### Besoins Utilisateurs (Top 3)
1. Créer des factures qui reflètent leur identité de marque
2. Simplifier le processus de facturation et de paiement
3. Gagner du temps sur les tâches administratives

---

## 4. Solution Overview

### Vue d'Ensemble
FigmaInvoice est une application web qui connecte Figma à un système de gestion de factures. L'utilisateur design sa facture dans Figma, l'importe dans FigmaInvoice, et peut ensuite l'envoyer à ses clients avec un lien de paiement intégré.

### Fonctionnalités Core (MVP)

| Fonctionnalité | Description |
|----------------|-------------|
| **Import Figma** | Importer un design de facture depuis Figma via l'API |
| **Édition in-app** | Modifier les données (montants, dates, infos client) directement dans l'application |
| **Vue client + Paiement** | Générer une page temporaire pour que le client voie et paie la facture |
| **Export PDF** | Télécharger la facture en format PDF haute qualité |
| **Gestion clients** | Base de données clients simple pour réutilisation |

### Intégration Paiement
- **Stripe** comme solution principale (CB, Apple Pay, Google Pay)
- Flexibilité pour ajouter d'autres méthodes de paiement

### Proposition de Valeur
> "Designez votre facture dans Figma. Envoyez-la. Soyez payé. C'est tout."

---

## 5. Business Objectives

### Modèle de Revenus
**Commission par facture payée** : Pourcentage prélevé sur chaque facture réglée via la plateforme.

### Objectifs SMART

| Objectif | Métrique | Cible 6 mois |
|----------|----------|--------------|
| Acquisition | Utilisateurs actifs mensuels | 500-2000 MAU |
| Engagement | Factures créées/mois | 2000+ factures |
| Revenus | Volume facturé via plateforme | Validation PMF |
| Rétention | Utilisateurs actifs M2/M1 | >60% |

### Valeur Business Attendue
- Validation du product-market fit
- Base utilisateurs pour croissance future
- Revenus récurrents via commission

---

## 6. Scope

### IN SCOPE (MVP v1)

- [ ] Authentification utilisateur (email, OAuth Figma)
- [ ] Connexion à l'API Figma pour import de designs
- [ ] Éditeur in-app pour modifier les données de facturation
- [ ] Mapping des champs du design aux données de facture
- [ ] Génération de vue client avec URL temporaire/unique
- [ ] Intégration Stripe pour paiement en ligne
- [ ] Export PDF de la facture
- [ ] Gestion basique des clients (CRUD)
- [ ] Dashboard simple avec liste des factures
- [ ] Notifications email (facture envoyée, paiement reçu)

### OUT OF SCOPE (MVP v1)

- Comptabilité complète (grand livre, bilan, déclarations TVA)
- Multi-devises avec conversion automatique en temps réel
- Application mobile native (iOS/Android)
- Intégrations tierces (Zapier, QuickBooks, Xero)
- Fonctionnalités d'équipe/collaboration

### FUTURE PHASES (v2+)

- [ ] **Devis/Quotes** : Création de devis convertibles en factures
- [ ] **Factures récurrentes** : Abonnements et facturation automatique
- [ ] **Tableau de bord analytics** : Stats revenus, clients, tendances
- [ ] **Multi-utilisateurs/équipes** : Collaboration au sein d'une agence
- [ ] Multi-devises avancé
- [ ] Intégrations comptables

---

## 7. Stakeholders

| Nom/Rôle | Influence | Intérêt |
|----------|-----------|---------|
| **Fondateur/Développeur** | Haute | Décideur unique sur toutes les décisions produit et techniques. Responsable de la vision, du développement et du lancement. |

---

## 8. Constraints & Assumptions

### Contraintes

| Contrainte | Impact | Mitigation |
|------------|--------|------------|
| **Budget limité** | Choix d'infrastructure et services | Utiliser des solutions open-source et services avec free tier généreux |
| **Dépendance API Figma** | Fonctionnalités limitées par l'API | Concevoir avec flexibilité, prévoir des fallbacks |
| **Conformité légale** | RGPD, exigences de facturation | Consulter les exigences légales par marché cible, implémenter les champs obligatoires |

### Hypothèses

| Hypothèse | Validation Prévue |
|-----------|-------------------|
| Les utilisateurs cibles ont un compte Figma et savent l'utiliser | Ciblage marketing, onboarding |
| Ils facturent régulièrement des clients récurrents | Interviews utilisateurs |
| Leurs clients acceptent le paiement en ligne par CB | Analyse du marché cible |
| Le design personnalisé de la facture est important pour eux | Enquêtes, tests utilisateurs |

---

## 9. Success Criteria

### Métriques Clés de Succès

| Métrique | Description | Cible MVP |
|----------|-------------|-----------|
| **MAU** | Utilisateurs actifs mensuels | 500+ |
| **Rétention M2** | % utilisateurs actifs au mois 2 | >50% |
| **Volume facturé** | Montant total facturé via la plateforme | Croissance mensuelle |
| **NPS** | Net Promoter Score | >30 |

### Indicateurs Qualitatifs
- Feedback positif sur la facilité d'utilisation
- Utilisateurs recommandent l'outil à d'autres freelances
- Factures créées sont visuellement conformes au design Figma original

---

## 10. Timeline & Milestones

### Jalons Clés

| Milestone | Description | Critères de Succès |
|-----------|-------------|-------------------|
| **M1: MVP Fonctionnel** | Première version utilisable avec toutes les features core | Import Figma, édition, paiement, PDF fonctionnels |
| **M2: Beta Privée** | Test avec un groupe restreint d'utilisateurs | 20-50 beta testers, feedback collecté |

---

## 11. Risks

### Risques Identifiés

| Risque | Probabilité | Impact | Mitigation |
|--------|-------------|--------|------------|
| **Limitations API Figma** | Moyenne | Élevé | Étudier l'API en profondeur avant le développement, concevoir des alternatives (upload manuel) |
| **Adoption utilisateurs** | Moyenne | Élevé | Validation early avec beta testers, itération rapide basée sur feedback |
| **Complexité technique (rendu fidèle)** | Élevée | Moyen | Prototype technique early, définir les limites acceptables de fidélité |
| **Conformité facturation légale** | Moyenne | Élevé | Recherche par pays cible, champs obligatoires configurables, mentions légales |

---

## 12. Technical Considerations (Initial)

### Stack Technique Envisagée
- **Frontend:** Next.js 15 (App Router)
- **ORM:** Drizzle (moderne, type-safe)
- **Database:** PostgreSQL
- **Styling:** Tailwind CSS
- **Payments:** Stripe
- **Auth:** NextAuth.js ou Clerk
- **PDF:** React-PDF ou Puppeteer
- **Hosting:** Vercel

### Intégrations Clés
- Figma API pour import de designs
- Stripe API pour paiements
- Service email pour notifications (Resend, SendGrid)

---

## Appendix

### Glossaire
- **MAU:** Monthly Active Users
- **PMF:** Product-Market Fit
- **NPS:** Net Promoter Score
- **CRUD:** Create, Read, Update, Delete

### Documents Connexes
- [ ] PRD (à créer)
- [ ] Architecture Document (à créer)
- [ ] Design Specs (Figma)

---

*Document généré via BMAD Method v6*
*Prochaine étape recommandée: /prd*
