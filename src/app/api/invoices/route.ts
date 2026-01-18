import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { invoices, invoiceItems, users, clients } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";

const invoiceItemSchema = z.object({
  name: z.string().min(1),
  description: z.string().nullable().optional(),
  quantity: z.number().positive(),
  unitPrice: z.number().min(0),
  total: z.number().min(0),
  sortOrder: z.number().int().min(0),
});

const createInvoiceSchema = z.object({
  clientId: z.string().uuid(),
  templateId: z.string().uuid().nullable().optional(),
  number: z.string().min(1),
  issueDate: z.string(),
  dueDate: z.string(),
  taxRate: z.number().min(0).max(100),
  subtotal: z.number().min(0),
  taxAmount: z.number().min(0),
  total: z.number().min(0),
  message: z.string().optional(),
  items: z.array(invoiceItemSchema).min(1),
});

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = createInvoiceSchema.parse(body);

    // Verify client belongs to user
    const client = await db.query.clients.findFirst({
      where: eq(clients.id, validatedData.clientId),
    });

    if (!client || client.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Client non trouvé" },
        { status: 404 }
      );
    }

    // Get user for snapshot
    const user = await db.query.users.findFirst({
      where: eq(users.id, session.user.id),
    });

    if (!user) {
      return NextResponse.json(
        { error: "Utilisateur non trouvé" },
        { status: 404 }
      );
    }

    // Create sender snapshot
    const senderSnapshot = {
      name: user.name,
      email: user.email,
      phone: user.phone,
      address: user.address,
      city: user.city,
      postalCode: user.postalCode,
      country: user.country,
      companyName: user.companyName,
      companyLogo: user.companyLogo,
      siret: user.siret,
      siren: user.siren,
      vatNumber: user.vatNumber,
      iban: user.iban,
      bic: user.bic,
      bankName: user.bankName,
      bankAddress: user.bankAddress,
    };

    // Create recipient snapshot
    const recipientSnapshot = {
      companyName: client.companyName,
      contactName: client.contactName,
      contactTitle: client.contactTitle,
      email: client.email,
      phone: client.phone,
      address: client.address,
      city: client.city,
      postalCode: client.postalCode,
      country: client.country,
      siret: client.siret,
      siren: client.siren,
      vatNumber: client.vatNumber,
    };

    // Create invoice
    const [invoice] = await db
      .insert(invoices)
      .values({
        userId: session.user.id,
        clientId: validatedData.clientId,
        templateId: validatedData.templateId || null,
        number: validatedData.number,
        status: "draft",
        issueDate: new Date(validatedData.issueDate),
        dueDate: new Date(validatedData.dueDate),
        subtotal: String(validatedData.subtotal),
        taxRate: String(validatedData.taxRate),
        taxAmount: String(validatedData.taxAmount),
        total: String(validatedData.total),
        message: validatedData.message || null,
        senderSnapshot,
        recipientSnapshot,
      })
      .returning();

    // Create invoice items
    if (validatedData.items.length > 0) {
      await db.insert(invoiceItems).values(
        validatedData.items.map((item) => ({
          invoiceId: invoice.id,
          name: item.name,
          description: item.description || null,
          quantity: String(item.quantity),
          unitPrice: String(item.unitPrice),
          total: String(item.total),
          sortOrder: item.sortOrder,
        }))
      );
    }

    // Update user's next invoice number
    await db
      .update(users)
      .set({
        nextInvoiceNumber: (user.nextInvoiceNumber || 1) + 1,
        updatedAt: new Date(),
      })
      .where(eq(users.id, session.user.id));

    return NextResponse.json({ success: true, data: invoice });
  } catch (error) {
    console.error("Error creating invoice:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Données invalides", details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Erreur lors de la création de la facture" },
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

    const userInvoices = await db.query.invoices.findMany({
      where: eq(invoices.userId, session.user.id),
      with: {
        client: true,
        items: true,
      },
      orderBy: (invoices, { desc }) => [desc(invoices.createdAt)],
    });

    return NextResponse.json({ success: true, data: userInvoices });
  } catch (error) {
    console.error("Error fetching invoices:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des factures" },
      { status: 500 }
    );
  }
}
