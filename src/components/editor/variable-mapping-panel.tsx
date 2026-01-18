"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { LinkIcon, X, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { FigmaElement, VariableName } from "@/types";

// Variable categories for organization (using VariableName format with dots)
const VARIABLE_CATEGORIES = {
  invoice: {
    label: "Facture",
    variables: [
      { name: "invoice.number", label: "Numéro de facture", example: "FAC-2024-001" },
      { name: "invoice.date", label: "Date de facture", example: "18/01/2026" },
      { name: "invoice.dueDate", label: "Date d'échéance", example: "17/02/2026" },
    ],
  },
  recipient: {
    label: "Client (Destinataire)",
    variables: [
      { name: "recipient.companyName", label: "Raison sociale", example: "Acme Corp" },
      { name: "recipient.contactName", label: "Nom du contact", example: "Jean Dupont" },
      { name: "recipient.contactTitle", label: "Titre du contact", example: "Directeur" },
      { name: "recipient.email", label: "Email", example: "contact@acme.com" },
      { name: "recipient.phone", label: "Téléphone", example: "+33 1 23 45 67 89" },
      { name: "recipient.address", label: "Adresse", example: "123 Rue..." },
      { name: "recipient.siret", label: "SIRET", example: "123 456 789 00012" },
      { name: "recipient.siren", label: "SIREN", example: "123 456 789" },
    ],
  },
  sender: {
    label: "Mon entreprise (Émetteur)",
    variables: [
      { name: "sender.companyName", label: "Raison sociale", example: "Mon Entreprise" },
      { name: "sender.name", label: "Nom", example: "Pierre Martin" },
      { name: "sender.email", label: "Email", example: "contact@monentreprise.fr" },
      { name: "sender.phone", label: "Téléphone", example: "+33 1 23 45 67 89" },
      { name: "sender.address", label: "Adresse", example: "456 Avenue..." },
      { name: "sender.siret", label: "SIRET", example: "987 654 321 00098" },
      { name: "sender.siren", label: "SIREN", example: "987 654 321" },
      { name: "sender.logo", label: "Logo", example: "[Logo]" },
    ],
  },
  totals: {
    label: "Totaux",
    variables: [
      { name: "totals.subtotal", label: "Sous-total HT", example: "1 000,00 €" },
      { name: "totals.taxRate", label: "Taux TVA", example: "20%" },
      { name: "totals.taxAmount", label: "Montant TVA", example: "200,00 €" },
      { name: "totals.total", label: "Total TTC", example: "1 200,00 €" },
    ],
  },
  service: {
    label: "Lignes de service (répétables)",
    variables: [
      { name: "service.name", label: "Nom du service", example: "Conseil" },
      { name: "service.description", label: "Description", example: "Service de conseil" },
      { name: "service.quantity", label: "Quantité", example: "10" },
      { name: "service.unitPrice", label: "Prix unitaire", example: "100,00 €" },
      { name: "service.total", label: "Total ligne", example: "1 000,00 €" },
    ],
  },
  bank: {
    label: "Coordonnées bancaires",
    variables: [
      { name: "bank.iban", label: "IBAN", example: "FR76 1234 5678 9012 3456 7890 123" },
      { name: "bank.bic", label: "BIC", example: "BNPAFRPP" },
      { name: "bank.name", label: "Nom de la banque", example: "BNP Paribas" },
      { name: "bank.address", label: "Adresse banque", example: "16 Bd des Italiens, Paris" },
    ],
  },
  other: {
    label: "Autres",
    variables: [
      { name: "terms", label: "Conditions de paiement", example: "30 jours" },
      { name: "message", label: "Message personnalisé", example: "Merci pour votre confiance" },
    ],
  },
} as const;

interface VariableMappingPanelProps {
  element: FigmaElement;
  currentMapping?: VariableName;
  onMappingChange: (variable: VariableName | null) => void;
}

export function VariableMappingPanel({
  element,
  currentMapping,
  onMappingChange,
}: VariableMappingPanelProps) {
  const [expandedCategory, setExpandedCategory] = useState<string | null>(
    currentMapping ? findCategoryForVariable(currentMapping) : "invoice"
  );

  const handleVariableSelect = (variableName: string) => {
    if (currentMapping === variableName) {
      onMappingChange(null);
    } else {
      onMappingChange(variableName as VariableName);
    }
  };

  const handleRemoveMapping = () => {
    onMappingChange(null);
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center justify-between">
          <span className="flex items-center gap-2">
            <LinkIcon className="h-4 w-4" />
            Mapper à une variable
          </span>
          {currentMapping && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2 text-xs"
              onClick={handleRemoveMapping}
            >
              <X className="h-3 w-3 mr-1" />
              Retirer
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {currentMapping && (
          <div className="p-2 bg-green-50 border border-green-200 rounded-md mb-3">
            <Label className="text-xs text-green-700">Mapping actuel</Label>
            <p className="text-sm font-medium text-green-800">
              {getVariableLabel(currentMapping)}
            </p>
          </div>
        )}

        <div className="space-y-1">
          {Object.entries(VARIABLE_CATEGORIES).map(([key, category]) => (
            <div key={key} className="border rounded-md overflow-hidden">
              <button
                className={cn(
                  "w-full flex items-center justify-between p-2 text-sm font-medium text-left",
                  "hover:bg-muted/50 transition-colors",
                  expandedCategory === key && "bg-muted/30"
                )}
                onClick={() =>
                  setExpandedCategory(expandedCategory === key ? null : key)
                }
              >
                <span>{category.label}</span>
                <ChevronDown
                  className={cn(
                    "h-4 w-4 transition-transform",
                    expandedCategory === key && "rotate-180"
                  )}
                />
              </button>

              {expandedCategory === key && (
                <div className="border-t bg-background">
                  {category.variables.map((variable) => {
                    const isSelected = currentMapping === variable.name;
                    return (
                      <button
                        key={variable.name}
                        className={cn(
                          "w-full flex flex-col items-start p-2 text-left",
                          "hover:bg-muted/50 transition-colors border-b last:border-b-0",
                          isSelected && "bg-green-50"
                        )}
                        onClick={() => handleVariableSelect(variable.name)}
                      >
                        <span
                          className={cn(
                            "text-sm font-medium",
                            isSelected && "text-green-700"
                          )}
                        >
                          {variable.label}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          Ex: {variable.example}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="pt-2 border-t mt-3">
          <p className="text-xs text-muted-foreground">
            Sélectionnez une variable pour remplacer le contenu de cet élément
            lors de la génération de factures.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

// Helper functions
function findCategoryForVariable(variableName: string): string | null {
  for (const [key, category] of Object.entries(VARIABLE_CATEGORIES)) {
    if (category.variables.some((v) => v.name === variableName)) {
      return key;
    }
  }
  return null;
}

function getVariableLabel(variableName: string): string {
  for (const category of Object.values(VARIABLE_CATEGORIES)) {
    const variable = category.variables.find((v) => v.name === variableName);
    if (variable) {
      return variable.label;
    }
  }
  return variableName;
}
