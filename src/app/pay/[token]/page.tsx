import { db } from "@/lib/db";
import { invoices } from "@/lib/db/schema";
import { eq, and, gte } from "drizzle-orm";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  FileText,
  Calendar,
  Building2,
  CreditCard,
  CheckCircle,
  Clock,
  AlertTriangle,
} from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { PaymentButton } from "@/components/payment/payment-button";

async function getInvoiceByToken(token: string) {
  return db.query.invoices.findFirst({
    where: and(
      eq(invoices.paymentToken, token),
      gte(invoices.paymentTokenExpiresAt, new Date())
    ),
    with: {
      client: true,
      items: {
        orderBy: (items, { asc }) => [asc(items.sortOrder)],
      },
    },
  });
}

export default async function PublicPaymentPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const invoice = await getInvoiceByToken(token);

  if (!invoice) {
    notFound();
  }

  const senderSnapshot = invoice.senderSnapshot as Record<string, any> | null;
  const recipientSnapshot = invoice.recipientSnapshot as Record<string, any> | null;
  const isPaid = invoice.status === "paid";
  const isPartiallyPaid = invoice.status === "partially_paid";
  const remainingAmount =
    parseFloat(invoice.total) - parseFloat(invoice.amountPaid);

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">
            {senderSnapshot?.companyName || "Facture"}
          </h1>
          <p className="text-muted-foreground mt-1">
            Facture {invoice.number}
          </p>
        </div>

        {/* Status banner */}
        {isPaid && (
          <Card className="bg-green-50 border-green-200">
            <CardContent className="flex items-center gap-3 py-4">
              <CheckCircle className="h-6 w-6 text-green-600" />
              <div>
                <p className="font-medium text-green-800">Facture payée</p>
                <p className="text-sm text-green-600">
                  Paiement reçu le{" "}
                  {invoice.paidAt ? formatDate(invoice.paidAt) : "récemment"}
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {isPartiallyPaid && (
          <Card className="bg-orange-50 border-orange-200">
            <CardContent className="flex items-center gap-3 py-4">
              <Clock className="h-6 w-6 text-orange-600" />
              <div>
                <p className="font-medium text-orange-800">
                  Paiement partiel reçu
                </p>
                <p className="text-sm text-orange-600">
                  Reste à payer : {formatCurrency(remainingAmount)}
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {invoice.status === "overdue" && (
          <Card className="bg-red-50 border-red-200">
            <CardContent className="flex items-center gap-3 py-4">
              <AlertTriangle className="h-6 w-6 text-red-600" />
              <div>
                <p className="font-medium text-red-800">Facture en retard</p>
                <p className="text-sm text-red-600">
                  Date d'échéance dépassée le {formatDate(invoice.dueDate)}
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Invoice details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Détails de la facture
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Parties */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-2">
                  De
                </h4>
                <div className="space-y-1">
                  <p className="font-medium">
                    {senderSnapshot?.companyName || senderSnapshot?.name}
                  </p>
                  {senderSnapshot?.address && (
                    <p className="text-sm text-muted-foreground">
                      {senderSnapshot.address}
                    </p>
                  )}
                  {senderSnapshot?.email && (
                    <p className="text-sm">{senderSnapshot.email}</p>
                  )}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-2">
                  À
                </h4>
                <div className="space-y-1">
                  <p className="font-medium">
                    {recipientSnapshot?.companyName || invoice.client?.companyName}
                  </p>
                  {recipientSnapshot?.contactName && (
                    <p className="text-sm">{recipientSnapshot.contactName}</p>
                  )}
                  {recipientSnapshot?.address && (
                    <p className="text-sm text-muted-foreground">
                      {recipientSnapshot.address}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Dates */}
            <div className="flex gap-6 text-sm">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Émise le</span>
                <span className="font-medium">
                  {formatDate(invoice.issueDate)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Échéance</span>
                <span className="font-medium">
                  {formatDate(invoice.dueDate)}
                </span>
              </div>
            </div>

            {/* Items */}
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-3">
                Prestations
              </h4>
              <div className="rounded-lg border">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="px-4 py-2 text-left text-sm font-medium">
                        Description
                      </th>
                      <th className="px-4 py-2 text-right text-sm font-medium">
                        Qté
                      </th>
                      <th className="px-4 py-2 text-right text-sm font-medium">
                        Prix
                      </th>
                      <th className="px-4 py-2 text-right text-sm font-medium">
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoice.items.map((item) => (
                      <tr key={item.id} className="border-b last:border-0">
                        <td className="px-4 py-3">
                          <p className="font-medium">{item.name}</p>
                          {item.description && (
                            <p className="text-sm text-muted-foreground">
                              {item.description}
                            </p>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right">{item.quantity}</td>
                        <td className="px-4 py-3 text-right">
                          {formatCurrency(item.unitPrice)}
                        </td>
                        <td className="px-4 py-3 text-right font-medium">
                          {formatCurrency(item.total)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Totals */}
            <div className="flex justify-end">
              <div className="w-64 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Sous-total HT</span>
                  <span>{formatCurrency(invoice.subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    TVA ({invoice.taxRate}%)
                  </span>
                  <span>{formatCurrency(invoice.taxAmount)}</span>
                </div>
                <div className="flex justify-between pt-2 border-t font-bold">
                  <span>Total TTC</span>
                  <span className="text-lg">
                    {formatCurrency(invoice.total)}
                  </span>
                </div>
                {parseFloat(invoice.amountPaid) > 0 && (
                  <>
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Déjà payé</span>
                      <span>{formatCurrency(invoice.amountPaid)}</span>
                    </div>
                    <div className="flex justify-between text-sm font-medium text-orange-600">
                      <span>Reste à payer</span>
                      <span>{formatCurrency(remainingAmount)}</span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Message */}
            {invoice.message && (
              <div className="pt-4 border-t">
                <h4 className="text-sm font-medium text-muted-foreground mb-2">
                  Message
                </h4>
                <p className="text-sm whitespace-pre-wrap">{invoice.message}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Payment section */}
        {!isPaid && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Paiement sécurisé
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <p className="text-3xl font-bold">
                  {formatCurrency(
                    isPartiallyPaid ? remainingAmount : invoice.total
                  )}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  {isPartiallyPaid ? "Montant restant" : "Montant total"}
                </p>
              </div>

              <PaymentButton
                invoiceId={invoice.id}
                token={token}
                amount={isPartiallyPaid ? remainingAmount : parseFloat(invoice.total)}
              />

              <p className="text-xs text-center text-muted-foreground">
                Paiement sécurisé par Stripe. Vos informations bancaires ne sont
                jamais stockées sur nos serveurs.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Footer */}
        <div className="text-center text-sm text-muted-foreground">
          <p>
            Ce lien de paiement expire le{" "}
            {invoice.paymentTokenExpiresAt
              ? formatDate(invoice.paymentTokenExpiresAt, {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })
              : "bientôt"}
          </p>
        </div>
      </div>
    </div>
  );
}
