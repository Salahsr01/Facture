import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { invoices, invoiceHistory } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { generateToken } from "@/lib/utils";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { expiresInDays = 30 } = body;

    // Verify invoice belongs to user
    const invoice = await db.query.invoices.findFirst({
      where: and(eq(invoices.id, id), eq(invoices.userId, session.user.id)),
    });

    if (!invoice) {
      return NextResponse.json(
        { error: "Facture non trouvée" },
        { status: 404 }
      );
    }

    // Generate payment token
    const paymentToken = generateToken(32);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expiresInDays);

    // Update invoice with payment token
    const [updatedInvoice] = await db
      .update(invoices)
      .set({
        paymentToken,
        paymentTokenExpiresAt: expiresAt,
        updatedAt: new Date(),
      })
      .where(eq(invoices.id, id))
      .returning();

    // Log action
    await db.insert(invoiceHistory).values({
      invoiceId: id,
      action: "payment_link_generated",
      metadata: { expiresAt: expiresAt.toISOString(), expiresInDays },
    });

    // Generate payment URL
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const paymentUrl = `${baseUrl}/pay/${paymentToken}`;

    return NextResponse.json({
      success: true,
      data: {
        paymentToken,
        paymentUrl,
        expiresAt,
      },
    });
  } catch (error) {
    console.error("Error generating payment link:", error);
    return NextResponse.json(
      { error: "Erreur lors de la génération du lien de paiement" },
      { status: 500 }
    );
  }
}
