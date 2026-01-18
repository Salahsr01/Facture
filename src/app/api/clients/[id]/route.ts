import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { clients, invoices } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { z } from "zod";

const updateClientSchema = z.object({
  companyName: z.string().min(1, "Le nom de l'entreprise est requis").optional(),
  contactName: z.string().nullable().optional(),
  contactTitle: z.string().nullable().optional(),
  email: z.string().email("Email invalide").optional(),
  phone: z.string().nullable().optional(),
  address: z.string().nullable().optional(),
  city: z.string().nullable().optional(),
  postalCode: z.string().nullable().optional(),
  country: z.string().nullable().optional(),
  siret: z.string().nullable().optional(),
  siren: z.string().nullable().optional(),
  vatNumber: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
  isActive: z.boolean().optional(),
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

    const client = await db.query.clients.findFirst({
      where: and(eq(clients.id, id), eq(clients.userId, session.user.id)),
    });

    if (!client) {
      return NextResponse.json(
        { error: "Client non trouvé" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: client });
  } catch (error) {
    console.error("Error fetching client:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération du client" },
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

    // Verify client belongs to user
    const existingClient = await db.query.clients.findFirst({
      where: and(eq(clients.id, id), eq(clients.userId, session.user.id)),
    });

    if (!existingClient) {
      return NextResponse.json(
        { error: "Client non trouvé" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const validatedData = updateClientSchema.parse(body);

    const [updatedClient] = await db
      .update(clients)
      .set({
        ...validatedData,
        updatedAt: new Date(),
      })
      .where(eq(clients.id, id))
      .returning();

    return NextResponse.json({ success: true, data: updatedClient });
  } catch (error) {
    console.error("Error updating client:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Données invalides", details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Erreur lors de la mise à jour du client" },
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

    // Verify client belongs to user
    const existingClient = await db.query.clients.findFirst({
      where: and(eq(clients.id, id), eq(clients.userId, session.user.id)),
    });

    if (!existingClient) {
      return NextResponse.json(
        { error: "Client non trouvé" },
        { status: 404 }
      );
    }

    // Check if client has invoices
    const clientInvoices = await db.query.invoices.findFirst({
      where: eq(invoices.clientId, id),
    });

    if (clientInvoices) {
      // Soft delete - mark as inactive
      await db
        .update(clients)
        .set({
          isActive: false,
          updatedAt: new Date(),
        })
        .where(eq(clients.id, id));

      return NextResponse.json({
        success: true,
        message: "Client désactivé (factures associées existantes)",
      });
    }

    // Hard delete if no invoices
    await db.delete(clients).where(eq(clients.id, id));

    return NextResponse.json({
      success: true,
      message: "Client supprimé",
    });
  } catch (error) {
    console.error("Error deleting client:", error);
    return NextResponse.json(
      { error: "Erreur lors de la suppression du client" },
      { status: 500 }
    );
  }
}
