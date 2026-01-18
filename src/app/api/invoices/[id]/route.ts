import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { invoices, invoiceItems, invoiceHistory } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { z } from "zod";
import { generateToken } from "@/lib/utils";

const updateInvoiceSchema = z.object({
  status: z
    .enum([
      "draft",
      "sent",
      "paid",
      "overdue",
      "partially_paid",
      "disputed",
      "cancelled",
    ])
    .optional(),
  number: z.string().optional(),
  issueDate: z.string().optional(),
  dueDate: z.string().optional(),
  taxRate: z.number().optional(),
  message: z.string().nullable().optional(),
});

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
        payments: true,
        history: {
          orderBy: (history, { desc }) => [desc(history.createdAt)],
        },
      },
    });

    if (!invoice) {
      return NextResponse.json(
        { error: "Facture non trouvée" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: invoice });
  } catch (error) {
    console.error("Error fetching invoice:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération de la facture" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { id } = await params;

    // Verify invoice belongs to user
    const existingInvoice = await db.query.invoices.findFirst({
      where: and(eq(invoices.id, id), eq(invoices.userId, session.user.id)),
    });

    if (!existingInvoice) {
      return NextResponse.json(
        { error: "Facture non trouvée" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const validatedData = updateInvoiceSchema.parse(body);

    // Track status change
    if (validatedData.status && validatedData.status !== existingInvoice.status) {
      await db.insert(invoiceHistory).values({
        invoiceId: id,
        action: "status_change",
        fromStatus: existingInvoice.status,
        toStatus: validatedData.status,
        metadata: { changedBy: session.user.id },
      });
    }

    // Build update object
    const updateData: Record<string, any> = {
      updatedAt: new Date(),
    };

    if (validatedData.status) updateData.status = validatedData.status;
    if (validatedData.number) updateData.number = validatedData.number;
    if (validatedData.issueDate)
      updateData.issueDate = new Date(validatedData.issueDate);
    if (validatedData.dueDate)
      updateData.dueDate = new Date(validatedData.dueDate);
    if (validatedData.taxRate !== undefined)
      updateData.taxRate = String(validatedData.taxRate);
    if (validatedData.message !== undefined)
      updateData.message = validatedData.message;

    const [updatedInvoice] = await db
      .update(invoices)
      .set(updateData)
      .where(eq(invoices.id, id))
      .returning();

    return NextResponse.json({ success: true, data: updatedInvoice });
  } catch (error) {
    console.error("Error updating invoice:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Données invalides", details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Erreur lors de la mise à jour de la facture" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { id } = await params;

    // Verify invoice belongs to user
    const existingInvoice = await db.query.invoices.findFirst({
      where: and(eq(invoices.id, id), eq(invoices.userId, session.user.id)),
    });

    if (!existingInvoice) {
      return NextResponse.json(
        { error: "Facture non trouvée" },
        { status: 404 }
      );
    }

    // Only allow deletion of draft invoices
    if (existingInvoice.status !== "draft") {
      return NextResponse.json(
        { error: "Seules les factures brouillon peuvent être supprimées" },
        { status: 400 }
      );
    }

    // Delete invoice items first
    await db.delete(invoiceItems).where(eq(invoiceItems.invoiceId, id));

    // Delete invoice
    await db.delete(invoices).where(eq(invoices.id, id));

    return NextResponse.json({ success: true, message: "Facture supprimée" });
  } catch (error) {
    console.error("Error deleting invoice:", error);
    return NextResponse.json(
      { error: "Erreur lors de la suppression de la facture" },
      { status: 500 }
    );
  }
}
