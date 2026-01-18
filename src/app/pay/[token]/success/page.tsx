import { db } from "@/lib/db";
import { invoices } from "@/lib/db/schema";
import { eq, and, gte } from "drizzle-orm";
import { notFound, redirect } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Download, ArrowLeft } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import Link from "next/link";

async function getInvoiceByToken(token: string) {
  return db.query.invoices.findFirst({
    where: eq(invoices.paymentToken, token),
    with: {
      client: true,
    },
  });
}

export default async function PaymentSuccessPage({
  params,
  searchParams,
}: {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ session_id?: string }>;
}) {
  const { token } = await params;
  const { session_id } = await searchParams;

  const invoice = await getInvoiceByToken(token);

  if (!invoice) {
    notFound();
  }

  const senderSnapshot = invoice.senderSnapshot as Record<string, any> | null;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-lg mx-auto space-y-6">
        {/* Success message */}
        <Card className="text-center">
          <CardContent className="pt-8 pb-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Paiement réussi !
            </h1>
            <p className="text-muted-foreground">
              Votre paiement a été traité avec succès.
            </p>
          </CardContent>
        </Card>

        {/* Invoice summary */}
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Facture</span>
                <span className="font-medium">{invoice.number}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Émetteur</span>
                <span className="font-medium">
                  {senderSnapshot?.companyName || "N/A"}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Montant</span>
                <span className="font-medium text-lg">
                  {formatCurrency(invoice.total)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Date</span>
                <span className="font-medium">
                  {formatDate(new Date())}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="space-y-3">
          <p className="text-sm text-center text-muted-foreground">
            Un email de confirmation vous sera envoyé sous peu.
          </p>
        </div>

        {/* Footer */}
        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            Merci pour votre confiance.
          </p>
        </div>
      </div>
    </div>
  );
}
