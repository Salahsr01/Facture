# Sprint Plan: FigmaInvoice

**Date:** 2026-01-18
**Scrum Master:** BMAD Method
**Project Level:** 2 (Medium)
**Total Stories:** 32
**Total Points:** 121
**Planned Sprints:** 4
**Target Completion:** ~8 semaines

---

## Executive Summary

Ce sprint plan détaille l'implémentation de FigmaInvoice, une application de facturation design-first pour freelances. Le projet est découpé en 4 sprints de 2 semaines, avec une progression logique des fondations vers les fonctionnalités avancées.

**Key Metrics:**
- Total Stories: 32
- Total Points: 121
- Sprints: 4
- Team Capacity: 30 points/sprint
- Target Completion: 8 semaines

---

## Story Inventory

### Infrastructure Stories

#### STORY-000: Setup Projet Next.js 16

**Epic:** Infrastructure
**Priority:** Must Have

**User Story:**
En tant que développeur,
Je veux initialiser le projet Next.js 16 avec la stack technique définie,
Afin d'avoir une base solide pour le développement.

**Acceptance Criteria:**
- [ ] Next.js 16 avec App Router configuré
- [ ] TypeScript strict mode activé
- [ ] Drizzle ORM configuré avec Neon PostgreSQL
- [ ] Tailwind CSS + shadcn/ui installés
- [ ] ESLint + Prettier configurés
- [ ] Structure des dossiers créée (app/, lib/, components/, etc.)
- [ ] Variables d'environnement configurées
- [ ] Déploiement Vercel initial fonctionnel

**Points:** 5

---

### EPIC-001: Authentification & Profil (FR-001, FR-002)

#### STORY-001: OAuth Figma - Configuration

**Epic:** EPIC-001
**Priority:** Must Have

**User Story:**
En tant qu'utilisateur,
Je veux me connecter avec mon compte Figma,
Afin d'accéder à l'application sans créer un nouveau compte.

**Acceptance Criteria:**
- [ ] App OAuth créée sur Figma Developer Console
- [ ] Auth.js configuré avec provider Figma
- [ ] Bouton "Se connecter avec Figma" fonctionnel
- [ ] Redirection OAuth vers Figma et retour
- [ ] Token d'accès stocké de manière sécurisée
- [ ] Création automatique de l'utilisateur en base

**Technical Notes:**
- Utiliser Auth.js v5 avec Drizzle adapter
- Stocker figmaAccessToken chiffré en DB

**Points:** 5

---

#### STORY-002: OAuth Figma - Gestion de Session

**Epic:** EPIC-001
**Priority:** Must Have

**User Story:**
En tant qu'utilisateur connecté,
Je veux rester connecté entre les sessions,
Afin de ne pas avoir à me reconnecter à chaque visite.

**Acceptance Criteria:**
- [ ] Session persistante avec cookies sécurisés
- [ ] Refresh token géré automatiquement
- [ ] Middleware de protection des routes authentifiées
- [ ] Déconnexion fonctionnelle (révoque l'accès)
- [ ] Redirection vers login si session expirée

**Points:** 3

---

#### STORY-003: Profil Utilisateur - Informations de Base

**Epic:** EPIC-001
**Priority:** Must Have

**User Story:**
En tant qu'utilisateur,
Je veux modifier mes informations personnelles,
Afin de personnaliser mon profil émetteur de factures.

**Acceptance Criteria:**
- [ ] Page /settings/profile accessible
- [ ] Formulaire édition : nom, email, téléphone
- [ ] Upload d'avatar (Vercel Blob)
- [ ] Upload de logo entreprise
- [ ] Validation des formats
- [ ] Sauvegarde en base de données

**Points:** 5

---

#### STORY-004: Profil Utilisateur - Informations Légales & Bancaires

**Epic:** EPIC-001
**Priority:** Must Have

**User Story:**
En tant que freelance,
Je veux saisir mes informations légales et bancaires,
Afin qu'elles apparaissent automatiquement sur mes factures.

**Acceptance Criteria:**
- [ ] Saisie adresse complète
- [ ] Saisie SIRET avec validation format (14 chiffres)
- [ ] Saisie SIREN avec validation format (9 chiffres)
- [ ] Saisie IBAN avec validation format
- [ ] Saisie BIC avec validation format
- [ ] Nom et adresse de la banque
- [ ] Champs chiffrés en base (tokens sensibles)

**Points:** 5

---

### EPIC-002: Import & Parsing Figma (FR-003, FR-004)

#### STORY-005: Import Figma - Saisie URL

**Epic:** EPIC-002
**Priority:** Must Have

**User Story:**
En tant qu'utilisateur,
Je veux importer un design Figma en collant son URL,
Afin de l'utiliser comme template de facture.

**Acceptance Criteria:**
- [ ] Page /templates/new accessible
- [ ] Champ de saisie URL Figma
- [ ] Validation du format URL Figma
- [ ] Extraction du fileKey et nodeId
- [ ] Indicateur de chargement pendant l'import
- [ ] Message d'erreur si URL invalide

**Points:** 3

---

#### STORY-006: Import Figma - Appel API

**Epic:** EPIC-002
**Priority:** Must Have

**User Story:**
En tant que système,
Je veux récupérer les données du design via l'API Figma,
Afin de pouvoir les analyser et les stocker.

**Acceptance Criteria:**
- [ ] Appel GET /v1/files/:fileKey/nodes
- [ ] Gestion des erreurs API (401, 403, 404)
- [ ] Récupération de la structure du design
- [ ] Stockage de la réponse brute pour analyse
- [ ] Timeout de 30s avec retry (1x)

**Technical Notes:**
- Utiliser le token OAuth de l'utilisateur
- Cache la réponse pendant 5 minutes

**Points:** 5

---

#### STORY-007: Parsing Design - Extraction Structure

**Epic:** EPIC-002
**Priority:** Must Have

**User Story:**
En tant que système,
Je veux parser la structure du design Figma,
Afin d'identifier les éléments modifiables.

**Acceptance Criteria:**
- [ ] Détection des TEXT nodes
- [ ] Détection des FRAME et GROUP
- [ ] Extraction des propriétés (couleur, police, taille, position)
- [ ] Génération d'ID unique par élément
- [ ] Construction de l'arbre des éléments
- [ ] Stockage de la structure parsée en DB

**Points:** 8

---

#### STORY-008: Parsing Design - Rendu Preview

**Epic:** EPIC-002
**Priority:** Must Have

**User Story:**
En tant qu'utilisateur,
Je veux voir un aperçu de mon design importé,
Afin de vérifier que l'import s'est bien passé.

**Acceptance Criteria:**
- [ ] Rendu du design sur un canvas React
- [ ] Affichage fidèle des positions et tailles
- [ ] Affichage des textes avec leurs styles
- [ ] Affichage des couleurs de fond
- [ ] Indication des éléments détectés
- [ ] Bouton "Confirmer" pour sauvegarder le template

**Points:** 8

---

### EPIC-003: Éditeur de Facture (FR-005, FR-006, FR-007)

#### STORY-009: Éditeur - Canvas Interactif

**Epic:** EPIC-003
**Priority:** Must Have

**User Story:**
En tant qu'utilisateur,
Je veux voir mon design sur un canvas interactif,
Afin de pouvoir sélectionner et modifier les éléments.

**Acceptance Criteria:**
- [ ] Canvas avec le design rendu
- [ ] Sélection d'un élément au clic
- [ ] Highlight de l'élément sélectionné
- [ ] Panneau latéral affichant les propriétés
- [ ] Zoom in/out sur le canvas

**Points:** 5

---

#### STORY-010: Éditeur - Mapping des Variables (Texte)

**Epic:** EPIC-003
**Priority:** Must Have

**User Story:**
En tant qu'utilisateur,
Je veux mapper des variables aux champs de texte,
Afin d'injecter automatiquement les données de facturation.

**Acceptance Criteria:**
- [ ] Liste des variables disponibles dans le panneau
- [ ] Dropdown pour sélectionner une variable
- [ ] Variables: {invoice.number}, {invoice.date}, {sender.*}, {recipient.*}, {service.*}, {totals.*}, {bank.*}, {terms}
- [ ] Preview avec données de test
- [ ] Indicateur visuel (badge) sur les éléments mappés
- [ ] Sauvegarde du mapping en DB

**Points:** 8

---

#### STORY-011: Éditeur - Modification des Styles

**Epic:** EPIC-003
**Priority:** Should Have

**User Story:**
En tant qu'utilisateur,
Je veux modifier les couleurs et polices d'un élément,
Afin de personnaliser le design sans retourner dans Figma.

**Acceptance Criteria:**
- [ ] Color picker pour couleur de texte
- [ ] Color picker pour couleur de fond
- [ ] Dropdown pour changer la police
- [ ] Input pour changer la taille de police
- [ ] Slider pour l'opacité
- [ ] Preview temps réel des modifications
- [ ] Bouton reset aux valeurs Figma originales

**Points:** 5

---

#### STORY-012: Éditeur - Sauvegarde Template

**Epic:** EPIC-003
**Priority:** Must Have

**User Story:**
En tant qu'utilisateur,
Je veux sauvegarder mon template avec ses mappings,
Afin de le réutiliser pour créer des factures.

**Acceptance Criteria:**
- [ ] Bouton "Sauvegarder le template"
- [ ] Nom du template configurable
- [ ] Sauvegarde de la structure, des mappings, des styles modifiés
- [ ] Confirmation de sauvegarde
- [ ] Redirection vers la liste des templates

**Points:** 3

---

### EPIC-004: Gestion des Factures (FR-008, FR-009, FR-010, FR-011)

#### STORY-013: Création de Facture - Formulaire

**Epic:** EPIC-004
**Priority:** Must Have

**User Story:**
En tant qu'utilisateur,
Je veux créer une nouvelle facture,
Afin de facturer un client.

**Acceptance Criteria:**
- [ ] Page /invoices/new accessible
- [ ] Sélection d'un template existant
- [ ] Sélection ou création rapide d'un client
- [ ] Numéro de facture auto-généré (configurable)
- [ ] Sélection date de facture et date d'échéance
- [ ] Statut initial : Brouillon

**Points:** 5

---

#### STORY-014: Création de Facture - Lignes de Services

**Epic:** EPIC-004
**Priority:** Must Have

**User Story:**
En tant qu'utilisateur,
Je veux ajouter des lignes de services à ma facture,
Afin de détailler les prestations facturées.

**Acceptance Criteria:**
- [ ] Ajout dynamique de lignes de services
- [ ] Champs: nom, description, quantité, prix unitaire
- [ ] Calcul automatique du total par ligne
- [ ] Suppression d'une ligne
- [ ] Réorganisation des lignes (drag & drop optionnel)

**Points:** 5

---

#### STORY-015: Création de Facture - Calculs Totaux

**Epic:** EPIC-004
**Priority:** Must Have

**User Story:**
En tant qu'utilisateur,
Je veux voir les totaux calculés automatiquement,
Afin de vérifier les montants de ma facture.

**Acceptance Criteria:**
- [ ] Sous-total calculé (somme des lignes)
- [ ] Configuration du taux de TVA (dropdown: 0%, 5.5%, 10%, 20%)
- [ ] Montant TVA calculé
- [ ] Total TTC calculé
- [ ] Affichage en temps réel lors des modifications

**Points:** 3

---

#### STORY-016: Liste des Factures - Dashboard

**Epic:** EPIC-004
**Priority:** Must Have

**User Story:**
En tant qu'utilisateur,
Je veux voir la liste de mes factures,
Afin de gérer mon activité de facturation.

**Acceptance Criteria:**
- [ ] Page /invoices (dashboard principal)
- [ ] Tableau avec colonnes: N°, Client, Date, Montant, Statut
- [ ] Tri par colonne
- [ ] Pagination (20 par page)
- [ ] Résumé des totaux par statut (cards en haut)
- [ ] Actions rapides (voir, éditer, dupliquer, supprimer)

**Points:** 5

---

#### STORY-017: Liste des Factures - Recherche & Filtres

**Epic:** EPIC-004
**Priority:** Must Have

**User Story:**
En tant qu'utilisateur,
Je veux rechercher et filtrer mes factures,
Afin de trouver rapidement ce que je cherche.

**Acceptance Criteria:**
- [ ] Barre de recherche textuelle (numéro, nom client)
- [ ] Filtres par statut (multi-sélection)
- [ ] Filtres par période (date début, date fin)
- [ ] Indicateur du nombre de résultats
- [ ] Bouton "Réinitialiser les filtres"

**Points:** 3

---

#### STORY-018: Gestion des Statuts de Facture

**Epic:** EPIC-004
**Priority:** Must Have

**User Story:**
En tant qu'utilisateur,
Je veux voir et changer le statut de mes factures,
Afin de suivre leur cycle de vie.

**Acceptance Criteria:**
- [ ] Badge de statut coloré (Brouillon=gris, Envoyée=bleu, Payée=vert, En retard=rouge, Partiellement payée=orange, Litige=violet, Annulée=gris barré)
- [ ] Transition automatique vers "En retard" après date d'échéance (job CRON ou webhook)
- [ ] Transition manuelle vers Litige ou Annulée
- [ ] Historique des changements de statut

**Points:** 5

---

#### STORY-019: Duplication de Facture

**Epic:** EPIC-004
**Priority:** Should Have

**User Story:**
En tant qu'utilisateur,
Je veux dupliquer une facture existante,
Afin de créer rapidement une facture similaire.

**Acceptance Criteria:**
- [ ] Bouton "Dupliquer" dans la liste et le détail
- [ ] Copie du template, client, lignes
- [ ] Nouveau numéro généré
- [ ] Date = aujourd'hui
- [ ] Statut = Brouillon
- [ ] Ouverture de l'éditeur

**Points:** 2

---

### EPIC-005: Gestion des Clients (FR-012)

#### STORY-020: Clients - CRUD Complet

**Epic:** EPIC-005
**Priority:** Must Have

**User Story:**
En tant qu'utilisateur,
Je veux gérer ma base de clients,
Afin de réutiliser leurs informations lors de la création de factures.

**Acceptance Criteria:**
- [ ] Page /clients avec liste
- [ ] Création: entreprise, contact (nom, fonction), email, téléphone, adresse, SIRET, SIREN
- [ ] Modification des informations
- [ ] Suppression (soft delete si factures associées)
- [ ] Recherche par nom/entreprise

**Points:** 5

---

#### STORY-021: Clients - Vue Détail avec Historique

**Epic:** EPIC-005
**Priority:** Must Have

**User Story:**
En tant qu'utilisateur,
Je veux voir le détail d'un client avec son historique,
Afin de suivre mes interactions avec lui.

**Acceptance Criteria:**
- [ ] Page /clients/:id avec infos complètes
- [ ] Liste des factures associées au client
- [ ] Statistiques: total facturé, nombre de factures, taux de paiement
- [ ] Lien rapide pour créer une nouvelle facture

**Points:** 3

---

### EPIC-006: Vue Client & Paiement (FR-013, FR-014, FR-015)

#### STORY-022: Génération du Lien de Paiement

**Epic:** EPIC-006
**Priority:** Must Have

**User Story:**
En tant qu'utilisateur,
Je veux générer un lien de paiement pour ma facture,
Afin de l'envoyer à mon client.

**Acceptance Criteria:**
- [ ] Génération d'un token unique et sécurisé (UUID + hash)
- [ ] URL format: /pay/:token
- [ ] Durée de validité configurable (7, 30, 60, 90 jours ou personnalisé)
- [ ] Stockage du token et expiration en DB
- [ ] Bouton "Copier le lien"

**Points:** 3

---

#### STORY-023: Vue Client - Page Publique

**Epic:** EPIC-006
**Priority:** Must Have

**User Story:**
En tant que client,
Je veux voir la facture que j'ai reçue,
Afin de vérifier les informations avant de payer.

**Acceptance Criteria:**
- [ ] Page /pay/:token accessible sans auth
- [ ] Rendu de la facture avec le design original
- [ ] Panneau émetteur (avatar, nom, message personnalisé)
- [ ] Boutons "Télécharger PDF" et "Payer"
- [ ] Message si lien expiré ou invalide
- [ ] Design mobile-friendly

**Points:** 5

---

#### STORY-024: Intégration Stripe Checkout

**Epic:** EPIC-006
**Priority:** Must Have

**User Story:**
En tant que client,
Je veux payer la facture en ligne,
Afin de régler ma dette facilement.

**Acceptance Criteria:**
- [ ] Bouton "Payer" crée une session Stripe Checkout
- [ ] Montant pré-rempli (total TTC)
- [ ] Support CB (Visa, Mastercard, Amex)
- [ ] Redirection vers Stripe Checkout
- [ ] Page de succès après paiement
- [ ] Page d'annulation si abandonné

**Points:** 5

---

#### STORY-025: Webhook Stripe - Confirmation Paiement

**Epic:** EPIC-006
**Priority:** Must Have

**User Story:**
En tant que système,
Je veux être notifié des paiements Stripe,
Afin de mettre à jour le statut des factures automatiquement.

**Acceptance Criteria:**
- [ ] Endpoint /api/webhooks/stripe configuré
- [ ] Validation de la signature Stripe
- [ ] Traitement de checkout.session.completed
- [ ] Mise à jour du statut facture vers "Payée"
- [ ] Création de l'enregistrement de paiement
- [ ] Email de confirmation à l'émetteur

**Points:** 5

---

#### STORY-026: Paiement Partiel (Acompte)

**Epic:** EPIC-006
**Priority:** Should Have

**User Story:**
En tant que client,
Je veux payer un acompte sur la facture,
Afin de régler partiellement ma dette.

**Acceptance Criteria:**
- [ ] Option activable par l'émetteur sur la facture
- [ ] Choix du montant: 25%, 50%, 75% ou montant libre
- [ ] Calcul du solde restant
- [ ] Statut "Partiellement payée"
- [ ] Historique des paiements partiels
- [ ] Notification à l'émetteur

**Points:** 5

---

### EPIC-007: Génération PDF (FR-016)

#### STORY-027: Génération PDF Serveur

**Epic:** EPIC-007
**Priority:** Must Have

**User Story:**
En tant qu'utilisateur,
Je veux télécharger ma facture en PDF,
Afin de l'archiver ou l'envoyer manuellement.

**Acceptance Criteria:**
- [ ] Génération PDF côté serveur (React-PDF ou Puppeteer)
- [ ] Rendu fidèle au design Figma
- [ ] Données dynamiques injectées
- [ ] Résolution haute qualité (300 DPI)
- [ ] Taille optimisée (< 2 MB)
- [ ] Nom: Facture_{numero}_{date}.pdf

**Points:** 8

---

#### STORY-028: Téléchargement PDF

**Epic:** EPIC-007
**Priority:** Must Have

**User Story:**
En tant qu'utilisateur ou client,
Je veux télécharger le PDF depuis l'interface,
Afin d'obtenir une copie de la facture.

**Acceptance Criteria:**
- [ ] Bouton "Télécharger PDF" dans le détail facture
- [ ] Bouton "Télécharger PDF" dans la vue client
- [ ] Téléchargement direct (pas de nouvelle fenêtre)
- [ ] Indicateur de chargement pendant génération
- [ ] Cache du PDF si déjà généré (invalidation si modif)

**Points:** 3

---

### EPIC-008: Notifications (FR-017, FR-018)

#### STORY-029: Envoi de Facture par Email

**Epic:** EPIC-008
**Priority:** Must Have

**User Story:**
En tant qu'utilisateur,
Je veux envoyer la facture à mon client par email,
Afin de le notifier et lui fournir le lien de paiement.

**Acceptance Criteria:**
- [ ] Bouton "Envoyer" depuis la facture
- [ ] Email pré-rempli avec adresse client
- [ ] Objet et message personnalisables
- [ ] Lien de paiement inclus automatiquement
- [ ] Option d'attacher le PDF
- [ ] Transition du statut vers "Envoyée"
- [ ] Historique des envois

**Points:** 5

---

#### STORY-030: Templates Email (React Email)

**Epic:** EPIC-008
**Priority:** Must Have

**User Story:**
En tant que système,
Je veux avoir des templates email professionnels,
Afin d'envoyer des communications de qualité.

**Acceptance Criteria:**
- [ ] Template "Nouvelle facture" avec branding
- [ ] Template "Paiement reçu"
- [ ] Template "Rappel avant échéance"
- [ ] Templates responsive (mobile-friendly)
- [ ] Variables dynamiques (nom, montant, lien)
- [ ] Rendu via React Email

**Points:** 5

---

#### STORY-031: Notifications Automatiques

**Epic:** EPIC-008
**Priority:** Should Have

**User Story:**
En tant qu'utilisateur,
Je veux recevoir des notifications automatiques,
Afin d'être informé des événements importants.

**Acceptance Criteria:**
- [ ] Email à l'émetteur lors d'un paiement reçu
- [ ] Email de rappel avant échéance (7j, 3j, 1j - configurable)
- [ ] Job CRON pour les rappels automatiques
- [ ] Possibilité de désactiver certaines notifications
- [ ] Log des emails envoyés

**Points:** 5

---

### Infrastructure & NFRs

#### STORY-032: Sécurité & Conformité RGPD

**Epic:** NFRs
**Priority:** Must Have

**User Story:**
En tant que système,
Je veux être conforme aux exigences de sécurité et RGPD,
Afin de protéger les données des utilisateurs.

**Acceptance Criteria:**
- [ ] HTTPS obligatoire (Vercel par défaut)
- [ ] Chiffrement des tokens en DB (Figma, Stripe)
- [ ] Cookies sécurisés (Secure, HttpOnly, SameSite)
- [ ] Page politique de confidentialité
- [ ] Export des données utilisateur (portabilité)
- [ ] Suppression de compte (droit à l'effacement)
- [ ] Rate limiting sur les API sensibles

**Points:** 5

---

## Sprint Allocation

### Sprint 1 (Semaines 1-2) - 28/30 points

**Goal:** Établir les fondations - Auth, Profil, Import Figma de base

**Stories:**
| ID | Titre | Points | Priorité |
|----|-------|--------|----------|
| STORY-000 | Setup Projet Next.js 16 | 5 | Must |
| STORY-001 | OAuth Figma - Configuration | 5 | Must |
| STORY-002 | OAuth Figma - Gestion de Session | 3 | Must |
| STORY-003 | Profil - Informations de Base | 5 | Must |
| STORY-004 | Profil - Infos Légales & Bancaires | 5 | Must |
| STORY-005 | Import Figma - Saisie URL | 3 | Must |
| STORY-032 | Sécurité & Conformité RGPD | 2 | Must |

**Total:** 28 points / 30 capacité (93% utilisation)

**Risques:**
- Configuration OAuth Figma peut nécessiter des ajustements
- Validation IBAN/SIRET peut être complexe

**Livrables:**
- Application déployée sur Vercel
- Authentification Figma fonctionnelle
- Profil utilisateur complet

---

### Sprint 2 (Semaines 3-4) - 29/30 points

**Goal:** Compléter l'import Figma et l'éditeur de base

**Stories:**
| ID | Titre | Points | Priorité |
|----|-------|--------|----------|
| STORY-006 | Import Figma - Appel API | 5 | Must |
| STORY-007 | Parsing Design - Extraction Structure | 8 | Must |
| STORY-008 | Parsing Design - Rendu Preview | 8 | Must |
| STORY-009 | Éditeur - Canvas Interactif | 5 | Must |
| STORY-012 | Éditeur - Sauvegarde Template | 3 | Must |

**Total:** 29 points / 30 capacité (97% utilisation)

**Risques:**
- Parsing Figma peut être plus complexe que prévu
- Rendu fidèle du design peut nécessiter des ajustements

**Livrables:**
- Import Figma fonctionnel
- Templates sauvegardés en base
- Prévisualisation du design

---

### Sprint 3 (Semaines 5-6) - 30/30 points

**Goal:** Éditeur avancé, création de factures et gestion clients

**Stories:**
| ID | Titre | Points | Priorité |
|----|-------|--------|----------|
| STORY-010 | Éditeur - Mapping des Variables | 8 | Must |
| STORY-013 | Création de Facture - Formulaire | 5 | Must |
| STORY-014 | Création de Facture - Lignes de Services | 5 | Must |
| STORY-015 | Création de Facture - Calculs Totaux | 3 | Must |
| STORY-020 | Clients - CRUD Complet | 5 | Must |
| STORY-021 | Clients - Vue Détail avec Historique | 3 | Must |
| STORY-032 | Sécurité & Conformité RGPD (suite) | 3 | Must |

**Total:** 32 points / 30 capacité (107% - à ajuster si besoin)

**Note:** Légèrement au-dessus de la capacité. STORY-021 peut être reportée si nécessaire.

**Risques:**
- Système de variables peut être complexe
- Calculs TVA doivent être précis

**Livrables:**
- Mapping variables fonctionnel
- Création de factures complète
- Gestion clients

---

### Sprint 4 (Semaines 7-8) - 34/30 points

**Goal:** Dashboard, paiements Stripe, PDF et notifications

**Stories:**
| ID | Titre | Points | Priorité |
|----|-------|--------|----------|
| STORY-016 | Liste des Factures - Dashboard | 5 | Must |
| STORY-017 | Liste des Factures - Recherche & Filtres | 3 | Must |
| STORY-018 | Gestion des Statuts de Facture | 5 | Must |
| STORY-022 | Génération du Lien de Paiement | 3 | Must |
| STORY-023 | Vue Client - Page Publique | 5 | Must |
| STORY-024 | Intégration Stripe Checkout | 5 | Must |
| STORY-025 | Webhook Stripe - Confirmation Paiement | 5 | Must |
| STORY-028 | Téléchargement PDF | 3 | Must |

**Total:** 34 points / 30 capacité (113%)

**Note:** Sprint chargé. Répartition possible sur Sprint 5 si nécessaire.

**Risques:**
- Intégration Stripe nécessite configuration compte Stripe
- Webhooks nécessitent tunnel local pour tests (ngrok)

**Livrables:**
- Dashboard complet
- Paiement Stripe fonctionnel
- Vue client accessible

---

### Sprint 5 (Backlog - Si Nécessaire)

**Stories reportées ou Should Have:**
| ID | Titre | Points | Priorité |
|----|-------|--------|----------|
| STORY-011 | Éditeur - Modification des Styles | 5 | Should |
| STORY-019 | Duplication de Facture | 2 | Should |
| STORY-026 | Paiement Partiel (Acompte) | 5 | Should |
| STORY-027 | Génération PDF Serveur | 8 | Must |
| STORY-029 | Envoi de Facture par Email | 5 | Must |
| STORY-030 | Templates Email (React Email) | 5 | Must |
| STORY-031 | Notifications Automatiques | 5 | Should |

**Total backlog:** 35 points

---

## Epic Traceability

| Epic ID | Epic Name | Stories | Total Points | Sprint(s) |
|---------|-----------|---------|--------------|-----------|
| Infrastructure | Setup & Sécurité | STORY-000, STORY-032 | 10 | 1 |
| EPIC-001 | Auth & Profil | STORY-001, 002, 003, 004 | 18 | 1 |
| EPIC-002 | Import Figma | STORY-005, 006, 007, 008 | 24 | 1-2 |
| EPIC-003 | Éditeur | STORY-009, 010, 011, 012 | 21 | 2-3 |
| EPIC-004 | Gestion Factures | STORY-013, 014, 015, 016, 017, 018, 019 | 28 | 3-4 |
| EPIC-005 | Clients | STORY-020, 021 | 8 | 3 |
| EPIC-006 | Vue Client & Paiement | STORY-022, 023, 024, 025, 026 | 23 | 4-5 |
| EPIC-007 | PDF | STORY-027, 028 | 11 | 4-5 |
| EPIC-008 | Notifications | STORY-029, 030, 031 | 15 | 5 |

---

## Functional Requirements Coverage

| FR ID | FR Name | Stories | Sprint |
|-------|---------|---------|--------|
| FR-001 | Auth OAuth Figma | STORY-001, 002 | 1 |
| FR-002 | Gestion Profil | STORY-003, 004 | 1 |
| FR-003 | Import Figma URL | STORY-005, 006 | 1-2 |
| FR-004 | Parsing Design | STORY-007, 008 | 2 |
| FR-005 | Mapping Variables | STORY-010 | 3 |
| FR-006 | Modification Styles | STORY-011 | 5 |
| FR-007 | Repositionnement | Non inclus MVP | - |
| FR-008 | Création Facture | STORY-013, 014, 015 | 3 |
| FR-009 | Gestion Statuts | STORY-018 | 4 |
| FR-010 | Liste Factures | STORY-016, 017 | 4 |
| FR-011 | Duplication | STORY-019 | 5 |
| FR-012 | Gestion Clients | STORY-020, 021 | 3 |
| FR-013 | Lien Paiement | STORY-022, 023 | 4 |
| FR-014 | Stripe Checkout | STORY-024, 025 | 4 |
| FR-015 | Paiement Partiel | STORY-026 | 5 |
| FR-016 | Génération PDF | STORY-027, 028 | 4-5 |
| FR-017 | Envoi Email | STORY-029 | 5 |
| FR-018 | Notifications Auto | STORY-030, 031 | 5 |

**Note:** FR-007 (Repositionnement) est "Could Have" et non inclus dans le MVP initial.

---

## Risks and Mitigation

### High

| Risque | Probabilité | Impact | Mitigation |
|--------|-------------|--------|------------|
| Parsing Figma complexe | Moyenne | Élevé | Prototype early, limiter les types de nodes supportés |
| Intégration Stripe | Faible | Élevé | Utiliser Stripe Test Mode, documentation complète |

### Medium

| Risque | Probabilité | Impact | Mitigation |
|--------|-------------|--------|------------|
| Rendu PDF fidèle | Moyenne | Moyen | Tester avec plusieurs designs, accepter des compromis |
| OAuth Figma refresh | Faible | Moyen | Implémenter retry avec re-auth |
| Surcharge Sprint 4 | Moyenne | Moyen | Reporter stories non-critiques à Sprint 5 |

### Low

| Risque | Probabilité | Impact | Mitigation |
|--------|-------------|--------|------------|
| Emails délivrabilité | Faible | Faible | Utiliser Resend (bonne réputation) |
| Browser compatibility | Faible | Faible | Tester Chrome/Safari/Firefox |

---

## Dependencies

### External

| Dépendance | Provider | Statut | Action Requise |
|------------|----------|--------|----------------|
| Figma API | Figma | ✅ Disponible | Créer App OAuth sur Figma Dev Console |
| Stripe API | Stripe | ✅ Disponible | Créer compte Stripe, configurer webhooks |
| Neon PostgreSQL | Neon | ✅ Disponible | Créer projet Neon |
| Resend | Resend | ✅ Disponible | Créer compte, vérifier domaine |
| Vercel | Vercel | ✅ Disponible | Configurer projet |

### Internal

- Auth doit être terminée avant toute autre feature
- Import Figma doit être terminé avant l'éditeur
- Templates doivent exister avant création de factures
- Factures doivent exister avant paiements

---

## Definition of Done

Pour qu'une story soit considérée comme terminée :

- [ ] Code implémenté et commité
- [ ] Tests unitaires écrits (≥70% coverage sur le nouveau code)
- [ ] Tests d'intégration passants
- [ ] Code review (auto-review si solo)
- [ ] Documentation mise à jour si nécessaire
- [ ] Déployé sur preview Vercel
- [ ] Critères d'acceptation validés
- [ ] Pas de régressions

---

## Next Steps

**Immédiat:** Commencer Sprint 1

```
Run /dev-story STORY-000 pour initialiser le projet Next.js 16
```

**Sprint Cadence:**
- Sprint length: 2 semaines
- Sprint planning: Lundi semaine 1
- Sprint review: Vendredi semaine 2
- Sprint retrospective: Vendredi semaine 2

**Ordre recommandé Sprint 1:**
1. STORY-000: Setup Projet (fondation)
2. STORY-001: OAuth Figma Config (auth)
3. STORY-002: Gestion de Session (auth)
4. STORY-003: Profil Base (profil)
5. STORY-004: Profil Légal (profil)
6. STORY-005: Import URL (début import)
7. STORY-032: Sécurité RGPD (transverse)

---

## Appendix: Story Point Reference

| Points | Complexité | Durée | Exemple |
|--------|------------|-------|---------|
| 1 | Triviale | 1-2h | Config, typo fix |
| 2 | Simple | 2-4h | CRUD basique |
| 3 | Modérée | 4-8h | Composant avec état |
| 5 | Complexe | 1-2j | Feature front+back |
| 8 | Très Complexe | 2-3j | Feature complète |
| 13 | À découper | N/A | Trop gros |

---

*Document généré via BMAD Method v6 - Phase 4 (Sprint Planning)*
*Prochaine étape recommandée: /dev-story STORY-000*
