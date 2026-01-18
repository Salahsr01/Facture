import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { stripe, formatAmountFromStripe } from "@/lib/stripe";
import { db } from "@/lib/db";
import { invoices, invoiceHistory, payments } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import Stripe from "stripe";

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const headersList = await headers();
    const signature = headersList.get("stripe-signature");

    if (!signature || !webhookSecret) {
      console.error("Missing signature or webhook secret");
      return NextResponse.json(
        { error: "Configuration manquante" },
        { status: 400 }
      );
    }

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error("Webhook signature verification failed:", err);
      return NextResponse.json(
        { error: "Signature invalide" },
        { status: 400 }
      );
    }

    // Handle the event
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutCompleted(session);
        break;
      }

      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await handlePaymentIntentSucceeded(paymentIntent);
        break;
      }

      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await handlePaymentIntentFailed(paymentIntent);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: "Erreur lors du traitement du webhook" },
      { status: 500 }
    );
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const invoiceId = session.metadata?.invoiceId;

  if (!invoiceId) {
    console.error("No invoice ID in session metadata");
    return;
  }

  const invoice = await db.query.invoices.findFirst({
    where: eq(invoices.id, invoiceId),
  });

  if (!invoice) {
    console.error(`Invoice not found: ${invoiceId}`);
    return;
  }

  const amountPaid = formatAmountFromStripe(session.amount_total || 0);
  const newAmountPaid = parseFloat(invoice.amountPaid) + amountPaid;
  const totalAmount = parseFloat(invoice.total);

  // Determine new status
  let newStatus: "paid" | "partially_paid" = "paid";
  if (newAmountPaid < totalAmount) {
    newStatus = "partially_paid";
  }

  // Update invoice
  await db
    .update(invoices)
    .set({
      status: newStatus,
      amountPaid: String(newAmountPaid),
      paidAt: newStatus === "paid" ? new Date() : null,
      updatedAt: new Date(),
    })
    .where(eq(invoices.id, invoiceId));

  // Record payment
  await db.insert(payments).values({
    invoiceId,
    amount: String(amountPaid),
    paymentMethod: "card",
    stripePaymentIntentId: session.payment_intent as string,
    payerEmail: session.customer_details?.email || null,
    paidAt: new Date(),
  });

  // Log action
  await db.insert(invoiceHistory).values({
    invoiceId,
    action: "payment_received",
    metadata: {
      amount: amountPaid,
      paymentMethod: "stripe",
      sessionId: session.id,
      newStatus,
    },
  });

  console.log(`Payment processed for invoice ${invoice.number}: €${amountPaid}`);
}

async function handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  const invoiceId = paymentIntent.metadata?.invoiceId;

  if (!invoiceId) {
    // Payment might have been handled by checkout.session.completed
    return;
  }

  console.log(`PaymentIntent succeeded for invoice ${invoiceId}`);
}

async function handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent) {
  const invoiceId = paymentIntent.metadata?.invoiceId;

  if (!invoiceId) {
    return;
  }

  // Log failed payment attempt
  await db.insert(invoiceHistory).values({
    invoiceId,
    action: "payment_failed",
    metadata: {
      paymentIntentId: paymentIntent.id,
      error: paymentIntent.last_payment_error?.message,
    },
  });

  console.error(`Payment failed for invoice ${invoiceId}`);
}
