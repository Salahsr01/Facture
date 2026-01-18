import type { InvoiceData, VariableName } from "@/types";

/**
 * Sample invoice data for preview mode
 */
export const SAMPLE_INVOICE_DATA: InvoiceData = {
  invoice: {
    number: "FAC-2026-0042",
    date: "18 janvier 2026",
    dueDate: "17 février 2026",
  },
  sender: {
    name: "Marie Dupont",
    email: "marie@studio-dupont.fr",
    phone: "+33 6 12 34 56 78",
    address: "42 Rue de la Paix\n75002 Paris",
    siret: "123 456 789 00012",
    siren: "123 456 789",
    companyName: "Studio Dupont",
    logo: "/logo-sample.png",
  },
  recipient: {
    companyName: "Acme Corporation",
    contactName: "Jean Martin",
    contactTitle: "Directeur Marketing",
    email: "j.martin@acme-corp.com",
    phone: "+33 1 23 45 67 89",
    address: "123 Avenue des Champs-Élysées\n75008 Paris",
    siret: "987 654 321 00098",
    siren: "987 654 321",
  },
  services: [
    {
      name: "Création identité visuelle",
      description: "Logo, charte graphique, déclinaisons",
      quantity: 1,
      unitPrice: 2500,
      total: 2500,
    },
    {
      name: "Design site web",
      description: "Maquettes desktop et mobile (5 pages)",
      quantity: 5,
      unitPrice: 450,
      total: 2250,
    },
    {
      name: "Consultation UX",
      description: "Audit et recommandations",
      quantity: 8,
      unitPrice: 120,
      total: 960,
    },
  ],
  totals: {
    subtotal: 5710,
    taxRate: 20,
    taxAmount: 1142,
    total: 6852,
  },
  bank: {
    iban: "FR76 1234 5678 9012 3456 7890 123",
    bic: "BNPAFRPP",
    name: "BNP Paribas",
    address: "16 Boulevard des Italiens, 75009 Paris",
  },
  terms: "Paiement à 30 jours",
  message: "Merci pour votre confiance. N'hésitez pas à me contacter pour toute question.",
};

/**
 * Get value from invoice data using dot notation variable name
 */
export function getInvoiceValue(
  data: InvoiceData,
  variable: VariableName
): string {
  const parts = variable.split(".");

  // Handle simple variables
  if (parts.length === 1) {
    if (variable === "terms") return data.terms || "";
    if (variable === "message") return data.message || "";
    return "";
  }

  const [category, field] = parts;

  switch (category) {
    case "invoice":
      return data.invoice[field as keyof typeof data.invoice] || "";
    case "sender":
      return String(data.sender[field as keyof typeof data.sender] || "");
    case "recipient":
      return String(data.recipient[field as keyof typeof data.recipient] || "");
    case "totals":
      const totalsValue = data.totals[field as keyof typeof data.totals];
      if (field === "taxRate") return `${totalsValue}%`;
      if (typeof totalsValue === "number") {
        return new Intl.NumberFormat("fr-FR", {
          style: "currency",
          currency: "EUR",
        }).format(totalsValue);
      }
      return String(totalsValue || "");
    case "bank":
      return String(data.bank[field as keyof typeof data.bank] || "");
    case "service":
      // For service variables, show a placeholder since it's repeating
      if (data.services.length > 0) {
        const service = data.services[0];
        const value = service[field as keyof typeof service];
        if (field === "quantity") return String(value);
        if (field === "unitPrice" || field === "total") {
          return new Intl.NumberFormat("fr-FR", {
            style: "currency",
            currency: "EUR",
          }).format(value as number);
        }
        return String(value || "");
      }
      return `[${field}]`;
    default:
      return "";
  }
}

/**
 * Format all services as lines for display
 */
export function formatServicesForPreview(
  services: InvoiceData["services"]
): string {
  return services
    .map(
      (s, i) =>
        `${i + 1}. ${s.name} - ${s.quantity} x ${new Intl.NumberFormat("fr-FR", {
          style: "currency",
          currency: "EUR",
        }).format(s.unitPrice)} = ${new Intl.NumberFormat("fr-FR", {
          style: "currency",
          currency: "EUR",
        }).format(s.total)}`
    )
    .join("\n");
}
