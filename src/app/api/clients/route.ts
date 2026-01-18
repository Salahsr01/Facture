import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { clients } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";

const createClientSchema = z.object({
  companyName: z.string().min(1, "Le nom de l'entreprise est requis"),
  contactName: z.string().nullable().optional(),
  contactTitle: z.string().nullable().optional(),
  email: z.string().email("Email invalide"),
  phone: z.string().nullable().optional(),
  address: z.string().nullable().optional(),
  city: z.string().nullable().optional(),
  postalCode: z.string().nullable().optional(),
  country: z.string().nullable().optional(),
  siret: z.string().nullable().optional(),
  siren: z.string().nullable().optional(),
  vatNumber: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = createClientSchema.parse(body);

    const [client] = await db
      .insert(clients)
      .values({
        userId: session.user.id,
        companyName: validatedData.companyName,
        contactName: validatedData.contactName || null,
        contactTitle: validatedData.contactTitle || null,
        email: validatedData.email,
        phone: validatedData.phone || null,
        address: validatedData.address || null,
        city: validatedData.city || null,
        postalCode: validatedData.postalCode || null,
        country: validatedData.country || "France",
        siret: validatedData.siret || null,
        siren: validatedData.siren || null,
        vatNumber: validatedData.vatNumber || null,
        notes: validatedData.notes || null,
      })
      .returning();

    return NextResponse.json({ success: true, data: client });
  } catch (error) {
    console.error("Error creating client:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Données invalides", details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Erreur lors de la création du client" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const userClients = await db.query.clients.findMany({
      where: eq(clients.userId, session.user.id),
      orderBy: (clients, { desc }) => [desc(clients.createdAt)],
    });

    return NextResponse.json({ success: true, data: userClients });
  } catch (error) {
    console.error("Error fetching clients:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des clients" },
      { status: 500 }
    );
  }
}
