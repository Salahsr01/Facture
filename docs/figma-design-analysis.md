# Analyse des Designs Figma - FigmaInvoice

**Date:** 2026-01-18
**Fichier Figma:** Facture (S89pJj1wSoayRafxikSNkV)

---

## Écrans Analysés

### 1. Vue Client (node-id: 1:96)
**URL:** https://www.figma.com/design/S89pJj1wSoayRafxikSNkV/Facture?node-id=1-96

**Description:** Page publique affichée au client final pour visualiser et payer sa facture.

**Composants:**
- Panneau gauche:
  - Avatar + nom de l'émetteur
  - Titre/fonction
  - Message personnalisé pour le client
  - Bouton "Télécharger la facture" (outline)
  - Bouton "Payer" (vert, CTA principal)

- Panneau droit (Facture):
  - Titre "Facture" (grande typographie)
  - Numéro de facture + Date
  - Section Émetteur (nom, Siret, Siren)
  - Section Destinataire (entreprise, contact, Siret, Siren)
  - Section Services (liste avec description, quantité, prix)
  - Calculs (Sous-total, TVA 20%, Total)
  - Section Bank (IBAN, BIC, adresse banque)
  - Section Termes (conditions de paiement)

**Design:** Fond sombre (#000), texte blanc, accents jaune/orange pour titres

---

### 2. Éditeur - Vue Simple (node-id: 2:151)
**URL:** https://www.figma.com/design/S89pJj1wSoayRafxikSNkV/Facture?node-id=2-151

**Description:** Interface d'édition basique après import depuis Figma.

**Composants:**
- Header:
  - Bouton retour "← Personnalisé votre Facture"
  - Badge connexion Figma + nom utilisateur

- Sidebar droite:
  - Nom du client destinataire
  - Pagination factures (← 1/23 →)
  - Badge statut (ex: "Attente")

- Zone centrale:
  - Prévisualisation de la facture

---

### 3. Éditeur - Mode Composant (node-id: 3:247)
**URL:** https://www.figma.com/design/S89pJj1wSoayRafxikSNkV/Facture?node-id=3-247

**Description:** Interface d'édition avec contrôles de personnalisation des éléments.

**Contrôles d'édition:**

| Contrôle | Icône | Description |
|----------|-------|-------------|
| Texte | `T` | Modifier le contenu textuel |
| Couleur | `■` | Picker couleur de fond/texte |
| Variable | `{ }` | Lier à une donnée dynamique |

**Panneau de propriétés (quand élément sélectionné):**
- Dimensions: "86 Huge x 31Hug"
- Police: Dropdown (Helvetica Medium, etc.)
- Taille: Dropdown (30px, etc.)
- Couleur: Input hex + opacité (#FFFFFF 100%)
- Patterns: Dropdown pour motifs/textures

**Annotation:** `*Optionelle` - certains champs peuvent rester vides

---

## Champs de Facture Identifiés

### Informations Générales
| Champ | Type | Exemple |
|-------|------|---------|
| Numéro facture | Auto/Manuel | F908 |
| Date facture | Date | Vendredi 2 Janvier 2026 |

### Émetteur
| Champ | Type | Exemple |
|-------|------|---------|
| Nom | Texte | Salah-Eddine Sriar |
| Fonction | Texte | Chef de Projet |
| Siret | Numéro | 023789739792 |
| Siren | Numéro | 023789 |

### Destinataire
| Champ | Type | Exemple |
|-------|------|---------|
| Entreprise | Texte | Entreprise |
| Contact | Texte | Edouart Pompet |
| Fonction | Texte | Responsable RH |
| Siret | Numéro | 023789739792 |
| Siren | Numéro | 023789 |

### Lignes de Service
| Champ | Type | Exemple |
|-------|------|---------|
| Nom service | Texte | Planification |
| Description | Texte long | Définition de la feuille de route... |
| Quantité | Nombre | 1 |
| Prix unitaire | Devise | 298€ |
| Total ligne | Calculé | 298€ |

### Totaux
| Champ | Type | Exemple |
|-------|------|---------|
| Sous-total | Calculé | 298 € |
| TVA | Pourcentage | 20% |
| Montant TVA | Calculé | 56,9 € |
| Total | Calculé | 354,9€ |

### Informations Bancaires
| Champ | Type | Exemple |
|-------|------|---------|
| IBAN | Texte | RS35 1234 5678 9012 3456 78 |
| BIC/SWIFT | Texte | SGBGBRSBG |
| Banque | Texte | UniCredit Bank Serbia |
| Adresse banque | Texte | Bulevar Mihajla Pupina 165V... |

### Termes et Conditions
| Champ | Type | Exemple |
|-------|------|---------|
| Conditions | Texte long | Un acompte de 50% est exigé... |

---

## Système de Variables Suggéré

Pour le mapping des champs dynamiques (boutons `{ }`):

```typescript
interface InvoiceData {
  // Général
  invoice_number: string;      // {invoice.number}
  invoice_date: Date;          // {invoice.date}

  // Émetteur (profil utilisateur)
  sender: {
    name: string;              // {sender.name}
    title: string;             // {sender.title}
    siret: string;             // {sender.siret}
    siren: string;             // {sender.siren}
    avatar?: string;           // {sender.avatar}
    message?: string;          // {sender.message}
  };

  // Destinataire (client)
  recipient: {
    company: string;           // {recipient.company}
    contact_name: string;      // {recipient.name}
    contact_title: string;     // {recipient.title}
    siret?: string;            // {recipient.siret}
    siren?: string;            // {recipient.siren}
  };

  // Services
  services: Array<{
    name: string;              // {service.name}
    description: string;       // {service.description}
    quantity: number;          // {service.quantity}
    unit_price: number;        // {service.unit_price}
    total: number;             // {service.total}
  }>;

  // Totaux
  subtotal: number;            // {totals.subtotal}
  tax_rate: number;            // {totals.tax_rate}
  tax_amount: number;          // {totals.tax_amount}
  total: number;               // {totals.total}

  // Bank
  bank: {
    iban: string;              // {bank.iban}
    bic: string;               // {bank.bic}
    name: string;              // {bank.name}
    address: string;           // {bank.address}
  };

  // Termes
  terms: string;               // {terms}
}
```

---

## Statuts de Facture

Basé sur le badge "Attente" visible dans le design:

| Statut | Couleur suggérée | Description |
|--------|------------------|-------------|
| Brouillon | Gris | Non envoyée |
| Attente | Orange/Jaune | Envoyée, en attente de paiement |
| Payée | Vert | Paiement reçu |
| En retard | Rouge | Date d'échéance dépassée |
| Annulée | Gris barré | Facture annulée |

---

## Notes pour l'Implémentation

1. **Import Figma:**
   - Utiliser l'API Figma pour récupérer la structure du design
   - Identifier les éléments texte et leurs positions
   - Créer un mapping entre éléments Figma et champs de données

2. **Éditeur WYSIWYG:**
   - Canvas avec la facture rendue
   - Sélection d'éléments au clic
   - Panneau de propriétés contextuel
   - Preview temps réel des modifications

3. **Système de templates:**
   - Sauvegarder les mappings comme "templates"
   - Réutiliser le même design pour plusieurs factures
   - Permettre des ajustements mineurs (couleurs, polices)

4. **Génération PDF:**
   - Rendre la facture avec les données réelles
   - Respecter fidèlement le design Figma original
   - Qualité impression (300 DPI)

---

*Document généré automatiquement lors de l'analyse BMAD*
