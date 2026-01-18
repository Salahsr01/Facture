import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { invoices } from "@/lib/db/schema";
import { eq, and, gte } from "drizzle-orm";
import { stripe, formatAmountForStripe } from "@/lib/stripe";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { invoiceId, token, amount } = body;

    if (!invoiceId || !token || !amount) {
      return NextResponse.json(
        { error: "Paramètres manquants" },
        { status: 400 }
      );
    }

    // Verify invoice exists and token is valid
    const invoice = await db.query.invoices.findFirst({
      where: and(
        eq(invoices.id, invoiceId),
        eq(invoices.paymentToken, token),
        gte(invoices.paymentTokenExpiresAt, new Date())
      ),
      with: {
        client: true,
      },
    });

    if (!invoice) {
      return NextResponse.json(
        { error: "Facture non trouvée ou lien expiré" },
        { status: 404 }
      );
    }

    // Check if invoice is already paid
    if (invoice.status === "paid") {
      return NextResponse.json(
        { error: "Cette facture a déjà été payée" },
        { status: 400 }
      );
    }

    const senderSnapshot = invoice.senderSnapshot as Record<string, any> | null;
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: {
              name: `Facture ${invoice.number}`,
              description: senderSnapshot?.companyName
                ? `Paiement à ${senderSnapshot.companyName}`
                : undefined,
            },
            unit_amount: formatAmountForStripe(amount),
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${baseUrl}/pay/${token}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/pay/${token}`,
      customer_email: invoice.client?.email || undefined,
      metadata: {
        invoiceId: invoice.id,
        invoiceNumber: invoice.number,
        paymentToken: token,
      },
      payment_intent_data: {
        metadata: {
          invoiceId: invoice.id,
          invoiceNumber: invoice.number,
          paymentToken: token,
        },
      },
    });

    return NextResponse.json({
      success: true,
      url: session.url,
      sessionId: session.id,
    });
  } catch (error) {
    console.error("Error creating checkout session:", error);

    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: "Erreur lors de la création de la session de paiement" },
      { status: 500 }
    );
  }
}
