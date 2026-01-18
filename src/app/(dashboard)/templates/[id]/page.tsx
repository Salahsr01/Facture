import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { templates } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { InvoicePreview } from "@/components/invoice/invoice-preview";
import Link from "next/link";

interface TemplatePageProps {
  params: Promise<{ id: string }>;
}

async function getTemplate(userId: string, templateId: string) {
  try {
    return await db.query.templates.findFirst({
      where: and(eq(templates.id, templateId), eq(templates.userId, userId)),
    });
  } catch {
    return null;
  }
}

export default async function TemplatePage({ params }: TemplatePageProps) {
  const { id } = await params;
  const session = await auth();

  if (!session?.user?.id) return null;

  const template = await getTemplate(session.user.id, id);

  if (!template) {
    notFound();
  }

  // Sample invoice data for preview
  const invoiceData = {
    number: "F908",
    date: "Vendredi 2 Janvier 2026",
    emetteur: {
      name: session.user.name || "Utilisateur",
      title: "Chef de Projet",
      siret: "023789739792",
      siren: "023789",
    },
    destinateur: {
      company: "Entreprise",
      name: "Edouart Pompet",
      title: "Responsable RH",
      siret: "023789739792",
      siren: "023789",
    },
    services: [
      {
        name: "Planification",
        description: "Définition de la feuille de route, des jalons et des livrables, coordination avec le client et établissement du calendrier global du projet.",
        quantity: 1,
        unitPrice: 298,
        total: 298,
      },
    ],
    subtotal: 298,
    tvaRate: 20,
    tvaAmount: 56.9,
    total: 354.9,
    bank: {
      iban: "RS35 1234 5678 9012 3456 78",
      bic: "SGBGBRSBG",
      bankName: "UniCredit Bank Serbia",
      bankAddress: "Bulevar Mihajla Pupina 165V, 11070 Belgrade, Serbie",
    },
    terms: [
      "Un acompte de 50 % est exigé avant le début du projet. Le solde restant est dû à la fin du projet, avant la livraison finale du site.",
      "Tout retard de paiement peut entraîner des retards dans le projet et donner lieu à des frais de retard de 5 % tous les 14 jours après la date d'échéance.",
      "Le périmètre de la prestation est défini dans la proposition validée. Toute fonctionnalité, page ou modification de design supplémentaire en dehors de ce périmètre sera facturée séparément.",
    ],
  };

  return (
    <div className="flex flex-col items-center">
      {/* Invoice Preview Container */}
      <div className="border border-white">
        <InvoicePreview data={invoiceData} />
      </div>

      {/* Customize Button */}
      <Link
        href={`/templates/${id}/edit`}
        className="mt-6 bg-white rounded-[4px] px-[15px] py-[9px] flex items-center justify-center overflow-hidden hover:bg-gray-100 transition-colors"
      >
        <p className="text-black text-[12px] font-medium" style={{ fontFamily: "'Helvetica Neue', sans-serif" }}>
          Personnaliser la Facture
        </p>
      </Link>
    </div>
  );
}
