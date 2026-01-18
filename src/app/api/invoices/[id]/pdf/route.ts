import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { invoices } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { generateInvoicePdf } from "@/lib/pdf-generator";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { id } = await params;

    const invoice = await db.query.invoices.findFirst({
      where: and(eq(invoices.id, id), eq(invoices.userId, session.user.id)),
      with: {
        client: true,
        items: {
          orderBy: (items, { asc }) => [asc(items.sortOrder)],
        },
      },
    });

    if (!invoice) {
      return NextResponse.json(
        { error: "Facture non trouvée" },
        { status: 404 }
      );
    }

    const pdfBuffer = await generateInvoicePdf({
      ...invoice,
      senderSnapshot: invoice.senderSnapshot as Record<string, any> | null,
      recipientSnapshot: invoice.recipientSnapshot as Record<string, any> | null,
    });

    return new Response(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="facture-${invoice.number}.pdf"`,
      },
    });
  } catch (error) {
    console.error("Error generating PDF:", error);
    return NextResponse.json(
      { error: "Erreur lors de la génération du PDF" },
      { status: 500 }
    );
  }
}
