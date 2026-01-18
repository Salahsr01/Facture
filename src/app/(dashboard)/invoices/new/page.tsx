import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { clients, templates, users } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { InvoiceForm } from "@/components/forms/invoice-form";
import { generateInvoiceNumber } from "@/lib/utils";
import { redirect } from "next/navigation";

async function getData(userId: string) {
  const [userClients, userTemplates, user] = await Promise.all([
    db.query.clients.findMany({
      where: eq(clients.userId, userId),
      orderBy: [desc(clients.createdAt)],
    }),
    db.query.templates.findMany({
      where: eq(templates.userId, userId),
      orderBy: [desc(templates.createdAt)],
    }),
    db.query.users.findFirst({
      where: eq(users.id, userId),
    }),
  ]);

  return { clients: userClients, templates: userTemplates, user };
}

export default async function NewInvoicePage({
  searchParams,
}: {
  searchParams: Promise<{ client?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const { clients, templates, user } = await getData(session.user.id);
  const params = await searchParams;

  // Generate next invoice number
  const invoiceNumber = generateInvoiceNumber(
    user?.invoicePrefix || "F",
    user?.nextInvoiceNumber || 1
  );

  return (
    <div className="container max-w-5xl py-6">
      <InvoiceForm
        clients={clients}
        templates={templates}
        defaultValues={{
          clientId: params.client,
          invoiceNumber,
          defaultTaxRate: user?.defaultTaxRate ? parseFloat(user.defaultTaxRate) : 20,
          defaultMessage: user?.defaultMessage || undefined,
        }}
      />
    </div>
  );
}
