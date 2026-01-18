# PRD - Product Requirements Document
## FigmaInvoice

**Version:** 1.0
**Date:** 2026-01-18
**Project Level:** 2 (Medium)
**Status:** Draft
**Author:** Product Manager (BMAD)

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Business Objectives](#2-business-objectives)
3. [User Personas](#3-user-personas)
4. [Functional Requirements](#4-functional-requirements)
5. [Non-Functional Requirements](#5-non-functional-requirements)
6. [Epics](#6-epics)
7. [Traceability Matrix](#7-traceability-matrix)
8. [Dependencies](#8-dependencies)
9. [Assumptions & Constraints](#9-assumptions--constraints)
10. [Out of Scope](#10-out-of-scope)
11. [Open Questions](#11-open-questions)
12. [Appendix](#12-appendix)

---

## 1. Executive Summary

**FigmaInvoice** est une application web de facturation design-first permettant aux freelances de transformer leurs designs de factures Figma en factures fonctionnelles, envoyables et payables en ligne.

**Proposition de valeur unique :**
- Contrôle total du design - aucun template imposé
- Le design Figma devient directement la facture finale
- Paiement intégré via Stripe

**Référence :** [Product Brief](./product-brief-figmainvoice-2026-01-18.md)

---

## 2. Business Objectives

### Objectifs SMART

| ID | Objectif | Métrique | Cible 6 mois | Priorité |
|----|----------|----------|--------------|----------|
| BO-001 | Acquisition utilisateurs | MAU | 500-2000 | Must |
| BO-002 | Engagement | Factures créées/mois | 2000+ | Must |
| BO-003 | Validation PMF | Volume facturé | Croissance MoM | Should |
| BO-004 | Rétention | M2/M1 ratio | >60% | Must |
| BO-005 | Satisfaction | NPS | >30 | Should |

### Modèle de Revenus
Commission par facture payée via la plateforme.

---

## 3. User Personas

### Persona 1: Designer Freelance
| Attribut | Détail |
|----------|--------|
| **Nom** | Sarah, UI/UX Designer |
| **Âge** | 28-35 ans |
| **Comportement** | Utilise Figma quotidiennement, facture 5-10 clients/mois |
| **Pain points** | Templates de facture génériques, double saisie des données |
| **Besoin** | Factures qui reflètent son identité de marque |

### Persona 2: Développeur Freelance
| Attribut | Détail |
|----------|--------|
| **Nom** | Marc, Full-Stack Developer |
| **Âge** | 30-40 ans |
| **Comportement** | Connait Figma mais pas expert, facture mensuellement |
| **Pain points** | Processus de facturation chronophage, suivi des paiements |
| **Besoin** | Simplicité et automatisation |

### Persona 3: Créatif Indépendant
| Attribut | Détail |
|----------|--------|
| **Nom** | Julie, Photographe |
| **Âge** | 25-45 ans |
| **Comportement** | Branding très important, factures personnalisées |
| **Pain points** | Outils de facturation trop corporate |
| **Besoin** | Cohérence avec son image de marque |

---

## 4. Functional Requirements

### FR-001: Authentification OAuth Figma

**Priority:** Must Have

**Description:**
L'utilisateur doit pouvoir se connecter à l'application via son compte Figma en utilisant OAuth 2.0.

**Acceptance Criteria:**
- [ ] Bouton "Se connecter avec Figma" visible sur la page de connexion
- [ ] Redirection vers Figma pour autorisation
- [ ] Récupération du token d'accès après autorisation
- [ ] Création automatique du compte utilisateur si premier login
- [ ] Gestion du refresh token pour sessions longues
- [ ] Déconnexion révoque l'accès

**Dependencies:** API Figma OAuth

---

### FR-002: Gestion du Profil Utilisateur

**Priority:** Must Have

**Description:**
L'utilisateur doit pouvoir configurer et gérer son profil professionnel complet avec toutes les informations nécessaires à la facturation.

**Acceptance Criteria:**
- [ ] Modification du nom, email, avatar
- [ ] Ajout/modification de l'adresse complète
- [ ] Ajout/modification du numéro de téléphone
- [ ] Upload du logo entreprise
- [ ] Saisie du numéro SIRET (format validé)
- [ ] Saisie du numéro SIREN (format validé)
- [ ] Configuration des informations bancaires (IBAN, BIC)
- [ ] Tous les champs sont persistés en base de données

**Dependencies:** FR-001

---

### FR-003: Import de Design Figma via URL

**Priority:** Must Have

**Description:**
L'utilisateur doit pouvoir importer un design de facture depuis Figma en collant l'URL du fichier ou du frame.

**Acceptance Criteria:**
- [ ] Champ de saisie pour l'URL Figma
- [ ] Validation du format URL Figma
- [ ] Extraction du fileKey et nodeId depuis l'URL
- [ ] Appel API Figma pour récupérer la structure du design
- [ ] Affichage d'un message d'erreur si URL invalide ou accès refusé
- [ ] Indicateur de chargement pendant l'import
- [ ] Prévisualisation du design importé

**Dependencies:** FR-001, API Figma

---

### FR-004: Parsing et Analyse du Design Figma

**Priority:** Must Have

**Description:**
Le système doit analyser la structure du design Figma importé pour identifier les éléments modifiables et créer un arbre de composants.

**Acceptance Criteria:**
- [ ] Détection des éléments texte (TEXT nodes)
- [ ] Détection des éléments de structure (FRAME, GROUP)
- [ ] Extraction des propriétés de style (couleurs, polices, tailles)
- [ ] Extraction des positions et dimensions
- [ ] Génération d'un ID unique pour chaque élément
- [ ] Stockage de la structure parsée en base de données
- [ ] Support des designs multi-pages (sélection de frame)

**Dependencies:** FR-003

---

### FR-005: Éditeur - Mapping des Variables

**Priority:** Must Have

**Description:**
L'utilisateur doit pouvoir associer des champs dynamiques (variables) aux éléments texte du design pour y injecter des données de facturation.

**Acceptance Criteria:**
- [ ] Sélection d'un élément texte au clic sur le canvas
- [ ] Affichage d'un panneau de mapping avec liste de variables disponibles
- [ ] Variables disponibles : {invoice.number}, {invoice.date}, {sender.*}, {recipient.*}, {service.*}, {totals.*}, {bank.*}, {terms}
- [ ] Application immédiate du mapping avec preview des données
- [ ] Sauvegarde du mapping pour réutilisation
- [ ] Possibilité de supprimer un mapping existant
- [ ] Indicateur visuel des éléments mappés vs non mappés

**Dependencies:** FR-004

---

### FR-006: Éditeur - Modification des Styles

**Priority:** Should Have

**Description:**
L'utilisateur doit pouvoir modifier les propriétés visuelles des éléments du design (couleurs, polices, tailles).

**Acceptance Criteria:**
- [ ] Sélection d'un élément affiche un panneau de propriétés
- [ ] Modification de la couleur de texte (color picker + hex input)
- [ ] Modification de la couleur de fond
- [ ] Modification de la police (dropdown avec polices disponibles)
- [ ] Modification de la taille de police (input numérique)
- [ ] Modification de l'opacité
- [ ] Preview temps réel des modifications
- [ ] Possibilité de reset aux valeurs originales Figma

**Dependencies:** FR-005

---

### FR-007: Éditeur - Repositionnement des Éléments

**Priority:** Could Have

**Description:**
L'utilisateur doit pouvoir repositionner et redimensionner les éléments du design directement dans l'éditeur.

**Acceptance Criteria:**
- [ ] Drag & drop pour déplacer un élément
- [ ] Poignées de redimensionnement sur les coins/bords
- [ ] Snap to grid optionnel
- [ ] Affichage des coordonnées X/Y et dimensions W/H
- [ ] Undo/Redo des modifications de position
- [ ] Contraintes de proportion optionnelles (lock aspect ratio)

**Dependencies:** FR-006

---

### FR-008: Création de Facture

**Priority:** Must Have

**Description:**
L'utilisateur doit pouvoir créer une nouvelle facture en associant un template (design importé), un client et des lignes de services.

**Acceptance Criteria:**
- [ ] Sélection d'un template existant ou import d'un nouveau
- [ ] Sélection ou création d'un client
- [ ] Génération automatique du numéro de facture (séquentiel, configurable)
- [ ] Sélection de la date de facture
- [ ] Sélection de la date d'échéance
- [ ] Ajout de lignes de services (nom, description, quantité, prix unitaire)
- [ ] Calcul automatique des totaux (sous-total, TVA, total)
- [ ] Configuration du taux de TVA
- [ ] Statut initial : Brouillon
- [ ] Sauvegarde automatique ou manuelle

**Dependencies:** FR-002, FR-005

---

### FR-009: Gestion des Statuts de Facture

**Priority:** Must Have

**Description:**
Le système doit gérer le cycle de vie complet d'une facture avec différents statuts.

**Acceptance Criteria:**
- [ ] Statuts disponibles : Brouillon, Envoyée, Payée, En retard, Partiellement payée, Litige, Annulée
- [ ] Transition Brouillon → Envoyée lors de l'envoi
- [ ] Transition Envoyée → Payée après paiement complet
- [ ] Transition Envoyée → Partiellement payée après paiement partiel
- [ ] Transition automatique Envoyée → En retard après date d'échéance
- [ ] Transition manuelle vers Litige ou Annulée
- [ ] Affichage du badge de statut avec couleur distincte
- [ ] Historique des changements de statut

**Dependencies:** FR-008

---

### FR-010: Liste et Recherche de Factures

**Priority:** Must Have

**Description:**
L'utilisateur doit pouvoir visualiser, rechercher et filtrer ses factures dans un dashboard.

**Acceptance Criteria:**
- [ ] Tableau listant toutes les factures avec colonnes : N°, Client, Date, Montant, Statut
- [ ] Tri par colonne (ASC/DESC)
- [ ] Recherche textuelle (numéro, nom client)
- [ ] Filtres par statut (multi-sélection)
- [ ] Filtres par période (date de création, date d'échéance)
- [ ] Pagination (20 items par page par défaut)
- [ ] Vue rapide des totaux par statut (ex: 5 en attente, 10 payées)

**Dependencies:** FR-008

---

### FR-011: Duplication de Facture

**Priority:** Should Have

**Description:**
L'utilisateur doit pouvoir dupliquer une facture existante pour créer rapidement une nouvelle facture similaire.

**Acceptance Criteria:**
- [ ] Bouton "Dupliquer" accessible depuis la liste et le détail
- [ ] Copie du template, client, lignes de services
- [ ] Nouveau numéro de facture généré automatiquement
- [ ] Nouvelle date de facture (date du jour)
- [ ] Statut initial : Brouillon
- [ ] Ouverture de l'éditeur après duplication

**Dependencies:** FR-008

---

### FR-012: Gestion des Clients (CRUD)

**Priority:** Must Have

**Description:**
L'utilisateur doit pouvoir gérer sa base de données clients avec les opérations CRUD complètes.

**Acceptance Criteria:**
- [ ] Création d'un client avec : Entreprise, Contact (nom, fonction), Email, Téléphone, Adresse, SIRET, SIREN
- [ ] Modification des informations client
- [ ] Suppression d'un client (soft delete si factures associées)
- [ ] Liste des clients avec recherche
- [ ] Vue détail client avec historique des factures
- [ ] Import de clients (CSV) - Could Have
- [ ] Export de clients (CSV) - Could Have

**Dependencies:** FR-001

---

### FR-013: Génération de Vue Client (Lien de Paiement)

**Priority:** Must Have

**Description:**
Le système doit générer une URL unique permettant au client final de visualiser et payer sa facture.

**Acceptance Criteria:**
- [ ] Génération d'un token unique et sécurisé
- [ ] URL format : /pay/{token} ou domaine personnalisé
- [ ] Durée de validité configurable (7, 30, 60, 90 jours ou personnalisé)
- [ ] Page publique accessible sans authentification
- [ ] Affichage de la facture avec le design original
- [ ] Informations de l'émetteur visibles (avatar, nom, message)
- [ ] Boutons "Télécharger PDF" et "Payer"
- [ ] Message personnalisable par l'émetteur
- [ ] Expiration du lien après la durée configurée
- [ ] Message d'erreur si lien expiré ou invalide

**Dependencies:** FR-008, FR-009

---

### FR-014: Intégration Stripe Checkout

**Priority:** Must Have

**Description:**
Le client doit pouvoir payer sa facture directement via Stripe Checkout depuis la vue client.

**Acceptance Criteria:**
- [ ] Bouton "Payer" redirige vers Stripe Checkout
- [ ] Montant pré-rempli (total ou montant partiel)
- [ ] Support CB (Visa, Mastercard, Amex)
- [ ] Support Apple Pay / Google Pay
- [ ] Webhook Stripe pour confirmer le paiement
- [ ] Mise à jour automatique du statut après paiement
- [ ] Email de confirmation au client et à l'émetteur
- [ ] Gestion des échecs de paiement

**Dependencies:** FR-013, Stripe API

---

### FR-015: Paiement Partiel (Acompte)

**Priority:** Should Have

**Description:**
Le client doit pouvoir effectuer un paiement partiel sur une facture.

**Acceptance Criteria:**
- [ ] Option de paiement partiel activable par l'émetteur
- [ ] Pourcentages prédéfinis (25%, 50%, 75%) ou montant libre
- [ ] Tracking des paiements partiels avec dates et montants
- [ ] Calcul du solde restant
- [ ] Statut "Partiellement payée" après premier paiement
- [ ] Notification à l'émetteur pour chaque paiement
- [ ] Historique des transactions visible

**Dependencies:** FR-014

---

### FR-016: Génération et Export PDF

**Priority:** Must Have

**Description:**
Le système doit pouvoir générer un fichier PDF de la facture fidèle au design Figma original.

**Acceptance Criteria:**
- [ ] Génération PDF côté serveur
- [ ] Rendu fidèle au design Figma (polices, couleurs, positions)
- [ ] Résolution haute qualité (300 DPI pour impression)
- [ ] Taille de fichier optimisée (< 2 MB)
- [ ] Téléchargement direct depuis le dashboard
- [ ] Téléchargement depuis la vue client
- [ ] Nom de fichier : Facture_{numero}_{date}.pdf
- [ ] Métadonnées PDF (titre, auteur, date)

**Dependencies:** FR-008

---

### FR-017: Envoi de Facture par Email

**Priority:** Must Have

**Description:**
L'utilisateur doit pouvoir envoyer une facture au client par email directement depuis l'application.

**Acceptance Criteria:**
- [ ] Bouton "Envoyer" depuis la liste ou le détail de facture
- [ ] Email pré-rempli avec adresse client
- [ ] Objet et corps de l'email personnalisables
- [ ] Lien vers la vue client inclus automatiquement
- [ ] Option d'attacher le PDF
- [ ] Transition du statut vers "Envoyée"
- [ ] Historique des envois (date, destinataire)
- [ ] Tracking d'ouverture (optionnel)

**Dependencies:** FR-013, FR-016, Service Email

---

### FR-018: Notifications Email Automatiques

**Priority:** Should Have

**Description:**
Le système doit envoyer des notifications email automatiques pour les événements clés.

**Acceptance Criteria:**
- [ ] Email à l'émetteur lors d'un paiement reçu
- [ ] Email au client après envoi de facture
- [ ] Email de rappel avant échéance (configurable : 7j, 3j, 1j)
- [ ] Email de relance après échéance (configurable)
- [ ] Templates email professionnels et personnalisables
- [ ] Possibilité de désactiver certaines notifications
- [ ] Logs des emails envoyés

**Dependencies:** FR-009, Service Email

---

## 5. Non-Functional Requirements

### NFR-001: Performance - Temps de Chargement

**Priority:** Must Have

**Description:**
L'application doit offrir une expérience utilisateur rapide et fluide.

**Acceptance Criteria:**
- [ ] Temps de chargement des pages < 500ms (95e percentile)
- [ ] Time to First Byte (TTFB) < 200ms
- [ ] First Contentful Paint (FCP) < 1.5s
- [ ] Largest Contentful Paint (LCP) < 2.5s
- [ ] Import Figma < 5s pour un design standard (< 100 éléments)
- [ ] Génération PDF < 3s

**Rationale:** Une application rapide améliore l'engagement et la satisfaction utilisateur.

---

### NFR-002: Performance - Capacité

**Priority:** Should Have

**Description:**
L'application doit supporter la charge utilisateur prévue.

**Acceptance Criteria:**
- [ ] Support de 100 utilisateurs simultanés (MVP)
- [ ] 1000 requêtes/minute en pic
- [ ] Base de données supportant 100,000 factures
- [ ] Stockage de 10,000 templates Figma

**Rationale:** Capacité suffisante pour le MVP et la beta.

---

### NFR-003: Disponibilité

**Priority:** Must Have

**Description:**
L'application doit être disponible pour les utilisateurs.

**Acceptance Criteria:**
- [ ] Uptime de 99% minimum (hors maintenance planifiée)
- [ ] Maintenance planifiée en dehors des heures de bureau (EU)
- [ ] Page de status publique
- [ ] Alertes automatiques en cas de downtime

**Rationale:** Les freelances ont besoin d'accéder à leurs factures à tout moment.

---

### NFR-004: Sécurité - RGPD

**Priority:** Must Have

**Description:**
L'application doit être conforme au Règlement Général sur la Protection des Données.

**Acceptance Criteria:**
- [ ] Politique de confidentialité accessible
- [ ] Consentement explicite pour le traitement des données
- [ ] Droit d'accès aux données personnelles
- [ ] Droit de rectification
- [ ] Droit à l'effacement (suppression du compte)
- [ ] Droit à la portabilité (export des données)
- [ ] Registre des traitements maintenu
- [ ] DPO désigné si nécessaire

**Rationale:** Obligation légale pour les utilisateurs européens.

---

### NFR-005: Sécurité - Transport et Stockage

**Priority:** Must Have

**Description:**
Les données doivent être protégées en transit et au repos.

**Acceptance Criteria:**
- [ ] HTTPS obligatoire (TLS 1.3)
- [ ] Certificat SSL/TLS valide
- [ ] Chiffrement de la base de données au repos (AES-256)
- [ ] Chiffrement des tokens Figma et Stripe
- [ ] Mots de passe hashés (bcrypt ou Argon2)
- [ ] HSTS activé
- [ ] Cookies sécurisés (Secure, HttpOnly, SameSite)

**Rationale:** Protection des données sensibles (financières, personnelles).

---

### NFR-006: Sécurité - Audit et Traçabilité

**Priority:** Should Have

**Description:**
Les actions sensibles doivent être tracées pour audit.

**Acceptance Criteria:**
- [ ] Log de toutes les connexions (succès et échecs)
- [ ] Log des modifications de profil
- [ ] Log des créations/modifications/suppressions de factures
- [ ] Log des paiements
- [ ] Rétention des logs : 1 an minimum
- [ ] Logs non modifiables (append-only)
- [ ] Accès aux logs restreint

**Rationale:** Conformité et investigation en cas de problème.

---

### NFR-007: Compatibilité - Navigateurs

**Priority:** Must Have

**Description:**
L'application doit fonctionner sur les navigateurs modernes.

**Acceptance Criteria:**
- [ ] Chrome (2 dernières versions)
- [ ] Firefox (2 dernières versions)
- [ ] Safari (2 dernières versions)
- [ ] Edge (2 dernières versions)
- [ ] Pas de support IE11

**Rationale:** Couverture de >95% du marché des navigateurs.

---

### NFR-008: Compatibilité - Responsive Design

**Priority:** Must Have

**Description:**
L'application doit s'adapter à toutes les tailles d'écran.

**Acceptance Criteria:**
- [ ] Desktop (>1200px) : Expérience complète
- [ ] Tablet (768px-1200px) : Expérience adaptée
- [ ] Mobile (320px-768px) : Fonctionnalités essentielles
- [ ] L'éditeur peut être limité sur mobile (notification)
- [ ] La vue client est 100% mobile-friendly

**Rationale:** Les utilisateurs accèdent depuis différents appareils.

---

### NFR-009: Accessibilité

**Priority:** Should Have

**Description:**
L'application doit être accessible aux personnes en situation de handicap.

**Acceptance Criteria:**
- [ ] WCAG 2.1 niveau AA minimum
- [ ] Navigation au clavier complète
- [ ] Contrastes de couleur suffisants (4.5:1)
- [ ] Labels ARIA pour les éléments interactifs
- [ ] Alternative textuelle pour les images
- [ ] Focus visible

**Rationale:** Inclusion et conformité légale dans certains pays.

---

### NFR-010: Maintenabilité

**Priority:** Should Have

**Description:**
Le code doit être maintenable et bien documenté.

**Acceptance Criteria:**
- [ ] Couverture de tests > 70%
- [ ] Documentation API (OpenAPI/Swagger)
- [ ] README avec instructions d'installation
- [ ] Code review obligatoire avant merge
- [ ] Linting et formatting automatiques
- [ ] CI/CD pipeline configuré

**Rationale:** Faciliter l'évolution et la correction de bugs.

---

## 6. Epics

### EPIC-001: Authentification & Profil

**Description:**
Permettre aux utilisateurs de se connecter via Figma OAuth et de gérer leur profil professionnel complet.

**Functional Requirements:**
- FR-001: Authentification OAuth Figma
- FR-002: Gestion du Profil Utilisateur

**Story Count Estimate:** 3-5 stories

**Priority:** Must Have

**Business Value:**
Fondation de l'application. Sans authentification et profil, aucune autre fonctionnalité n'est possible.

---

### EPIC-002: Import & Parsing Figma

**Description:**
Permettre l'import de designs Figma via URL et l'analyse de leur structure pour identifier les éléments modifiables.

**Functional Requirements:**
- FR-003: Import de Design Figma via URL
- FR-004: Parsing et Analyse du Design Figma

**Story Count Estimate:** 4-6 stories

**Priority:** Must Have

**Business Value:**
Core de la proposition de valeur. L'intégration Figma différencie FigmaInvoice des concurrents.

---

### EPIC-003: Éditeur de Facture

**Description:**
Interface d'édition permettant de mapper les variables, modifier les styles et repositionner les éléments du design.

**Functional Requirements:**
- FR-005: Éditeur - Mapping des Variables
- FR-006: Éditeur - Modification des Styles
- FR-007: Éditeur - Repositionnement des Éléments

**Story Count Estimate:** 5-8 stories

**Priority:** Must Have (FR-005), Should Have (FR-006), Could Have (FR-007)

**Business Value:**
L'éditeur permet aux utilisateurs de personnaliser leurs factures sans retourner dans Figma.

---

### EPIC-004: Gestion des Factures

**Description:**
CRUD complet des factures avec gestion des statuts, recherche, filtres et duplication.

**Functional Requirements:**
- FR-008: Création de Facture
- FR-009: Gestion des Statuts de Facture
- FR-010: Liste et Recherche de Factures
- FR-011: Duplication de Facture

**Story Count Estimate:** 4-6 stories

**Priority:** Must Have

**Business Value:**
Fonctionnalité core permettant la gestion quotidienne des factures.

---

### EPIC-005: Gestion des Clients

**Description:**
Base de données clients avec opérations CRUD et association aux factures.

**Functional Requirements:**
- FR-012: Gestion des Clients (CRUD)

**Story Count Estimate:** 3-4 stories

**Priority:** Must Have

**Business Value:**
Réutilisation des informations clients pour accélérer la création de factures.

---

### EPIC-006: Vue Client & Paiement

**Description:**
Page publique permettant au client de visualiser sa facture et de payer via Stripe.

**Functional Requirements:**
- FR-013: Génération de Vue Client (Lien de Paiement)
- FR-014: Intégration Stripe Checkout
- FR-015: Paiement Partiel (Acompte)

**Story Count Estimate:** 4-6 stories

**Priority:** Must Have (FR-013, FR-014), Should Have (FR-015)

**Business Value:**
Permet d'être payé directement via l'application - core du business model.

---

### EPIC-007: Génération PDF

**Description:**
Génération de fichiers PDF fidèles au design Figma original pour téléchargement et archivage.

**Functional Requirements:**
- FR-016: Génération et Export PDF

**Story Count Estimate:** 2-3 stories

**Priority:** Must Have

**Business Value:**
Les factures PDF sont requises légalement et pour l'archivage client.

---

### EPIC-008: Notifications

**Description:**
Système d'envoi d'emails transactionnels et de notifications automatiques.

**Functional Requirements:**
- FR-017: Envoi de Facture par Email
- FR-018: Notifications Email Automatiques

**Story Count Estimate:** 2-3 stories

**Priority:** Must Have (FR-017), Should Have (FR-018)

**Business Value:**
Communication professionnelle avec les clients et automatisation du suivi.

---

## 7. Traceability Matrix

### Epics → FRs → Estimated Stories

| Epic ID | Epic Name | FRs | Priority | Stories Est. |
|---------|-----------|-----|----------|--------------|
| EPIC-001 | Authentification & Profil | FR-001, FR-002 | Must | 3-5 |
| EPIC-002 | Import & Parsing Figma | FR-003, FR-004 | Must | 4-6 |
| EPIC-003 | Éditeur de Facture | FR-005, FR-006, FR-007 | Must/Should/Could | 5-8 |
| EPIC-004 | Gestion des Factures | FR-008, FR-009, FR-010, FR-011 | Must | 4-6 |
| EPIC-005 | Gestion des Clients | FR-012 | Must | 3-4 |
| EPIC-006 | Vue Client & Paiement | FR-013, FR-014, FR-015 | Must/Should | 4-6 |
| EPIC-007 | Génération PDF | FR-016 | Must | 2-3 |
| EPIC-008 | Notifications | FR-017, FR-018 | Must/Should | 2-3 |

**Total Estimated Stories: 27-41**

### Priority Summary

| Priority | FRs Count | NFRs Count |
|----------|-----------|------------|
| Must Have | 14 | 6 |
| Should Have | 3 | 4 |
| Could Have | 1 | 0 |
| **Total** | **18** | **10** |

---

## 8. Dependencies

### Internal Dependencies

| Dependency | Description | Impact |
|------------|-------------|--------|
| Auth → All Features | Authentification requise pour toutes les fonctionnalités | Bloquant |
| Import → Éditeur | Design Figma requis avant édition | Bloquant |
| Facture → Vue Client | Facture doit exister pour générer le lien | Bloquant |
| Profil → Facturation | Infos profil nécessaires sur les factures | Bloquant |

### External Dependencies

| Dependency | Provider | Usage | Fallback |
|------------|----------|-------|----------|
| Figma API | Figma | Import designs, OAuth | Upload manuel (future) |
| Stripe API | Stripe | Paiements | N/A (critique) |
| Email Service | Resend/SendGrid | Envoi emails | Alternative SMTP |
| PostgreSQL | Neon/Supabase | Base de données | N/A (critique) |
| Vercel | Vercel | Hébergement | Alternatives cloud |

---

## 9. Assumptions & Constraints

### Assumptions

| ID | Assumption | Validation |
|----|------------|------------|
| A-001 | Les utilisateurs ont un compte Figma | Ciblage marketing |
| A-002 | Les utilisateurs maîtrisent Figma | Onboarding, tutoriels |
| A-003 | Les clients acceptent le paiement en ligne | Étude marché cible |
| A-004 | L'API Figma permet d'extraire suffisamment de détails | Prototype technique |
| A-005 | Les freelances facturent régulièrement | Interviews utilisateurs |

### Constraints

| ID | Constraint | Impact | Mitigation |
|----|------------|--------|------------|
| C-001 | Budget limité | Choix d'infrastructure | Services avec free tier |
| C-002 | Dépendance API Figma | Limitations possibles | Fallbacks, import manuel |
| C-003 | Conformité facturation légale | Champs obligatoires par pays | Configuration par région |
| C-004 | Développeur solo | Capacité limitée | Priorisation stricte |

---

## 10. Out of Scope

Les éléments suivants sont **explicitement exclus** du MVP v1 :

| Élément | Raison | Phase Future |
|---------|--------|--------------|
| Comptabilité complète | Trop complexe, hors cible | v3+ |
| Multi-devises automatique | Complexité technique | v2 |
| App mobile native | Web responsive suffit | v3+ |
| Intégrations tierces (Zapier, QuickBooks) | Focus sur le core | v2 |
| Fonctionnalités d'équipe | Cible freelances solo | v2 |
| Devis/Quotes | Extension naturelle | v2 |
| Factures récurrentes | Automatisation avancée | v2 |
| Analytics avancés | Besoin de données | v2 |

---

## 11. Open Questions

| ID | Question | Owner | Due Date | Status |
|----|----------|-------|----------|--------|
| OQ-001 | Quel pourcentage de commission prélever ? | Business | Pre-launch | Open |
| OQ-002 | Faut-il un minimum de facturation pour commencer ? | Business | Pre-launch | Open |
| OQ-003 | Quelles polices web inclure par défaut ? | Design | Architecture | Open |
| OQ-004 | Comment gérer les designs Figma très complexes ? | Tech | Development | Open |
| OQ-005 | Faut-il supporter plusieurs langues dès le MVP ? | Product | Pre-launch | Open |

---

## 12. Appendix

### Glossaire

| Terme | Définition |
|-------|------------|
| **FR** | Functional Requirement |
| **NFR** | Non-Functional Requirement |
| **Epic** | Grande unité de travail regroupant plusieurs User Stories |
| **MVP** | Minimum Viable Product |
| **MoSCoW** | Méthode de priorisation (Must/Should/Could/Won't) |
| **SIRET** | Système d'Identification du Répertoire des Établissements |
| **SIREN** | Système d'Identification du Répertoire des ENtreprises |
| **RGPD** | Règlement Général sur la Protection des Données |

### Documents Connexes

| Document | Lien |
|----------|------|
| Product Brief | [product-brief-figmainvoice-2026-01-18.md](./product-brief-figmainvoice-2026-01-18.md) |
| Figma Design Analysis | [figma-design-analysis.md](./figma-design-analysis.md) |
| Architecture Document | À créer (Phase 3) |
| Sprint Planning | À créer (Phase 4) |

### Changelog

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-01-18 | Initial PRD |

---

*Document généré via BMAD Method v6*
*Prochaine étape recommandée: /architecture*
