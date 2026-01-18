import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { invoices } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ArrowLeft,
  Edit,
  Send,
  Download,
  ExternalLink,
  Copy,
  Clock,
  CreditCard,
  Building2,
  FileText,
  Calendar,
  User,
} from "lucide-react";
import { formatCurrency, formatDate, getStatusLabel, getStatusColor } from "@/lib/utils";
import { InvoiceActions } from "@/components/invoices/invoice-actions";
import { InvoiceStatusBadge } from "@/components/invoices/invoice-status-badge";

async function getInvoice(invoiceId: string, userId: string) {
  return db.query.invoices.findFirst({
    where: and(eq(invoices.id, invoiceId), eq(invoices.userId, userId)),
    with: {
      client: true,
      items: {
        orderBy: (items, { asc }) => [asc(items.sortOrder)],
      },
      payments: {
        orderBy: (payments, { desc }) => [desc(payments.paidAt)],
      },
      history: {
        orderBy: (history, { desc }) => [desc(history.createdAt)],
        limit: 10,
      },
    },
  });
}

export default async function InvoiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const { id } = await params;
  const invoice = await getInvoice(id, session.user.id);

  if (!invoice) {
    notFound();
  }

  const statusColor = getStatusColor(invoice.status);
  const senderSnapshot = invoice.senderSnapshot as Record<string, any> | null;
  const recipientSnapshot = invoice.recipientSnapshot as Record<string, any> | null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/invoices">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour
            </Link>
          </Button>
          <div className="h-6 w-px bg-border" />
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold">Facture {invoice.number}</h2>
              <InvoiceStatusBadge status={invoice.status} />
            </div>
            <p className="text-muted-foreground">
              Créée le {formatDate(invoice.createdAt)}
            </p>
          </div>
        </div>
        <InvoiceActions invoice={invoice} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Invoice details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Détails de la facture
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Sender & Recipient */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-2">
                    Émetteur
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
                    {senderSnapshot?.siret && (
                      <p className="text-sm text-muted-foreground">
                        SIRET: {senderSnapshot.siret}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-2">
                    Destinataire
                  </h4>
                  <div className="space-y-1">
                    <p className="font-medium">
                      {recipientSnapshot?.companyName ||
                        invoice.client?.companyName}
                    </p>
                    {recipientSnapshot?.contactName && (
                      <p className="text-sm">
                        {recipientSnapshot.contactName}
                        {recipientSnapshot.contactTitle &&
                          ` - ${recipientSnapshot.contactTitle}`}
                      </p>
                    )}
                    {recipientSnapshot?.address && (
                      <p className="text-sm text-muted-foreground">
                        {recipientSnapshot.address}
                      </p>
                    )}
                    {recipientSnapshot?.email && (
                      <p className="text-sm">{recipientSnapshot.email}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Items */}
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-3">
                  Lignes de facturation
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
                          Prix unit.
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
                          <td className="px-4 py-3 text-right">
                            {item.quantity}
                          </td>
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
                        <span>Payé</span>
                        <span>{formatCurrency(invoice.amountPaid)}</span>
                      </div>
                      <div className="flex justify-between text-sm font-medium text-orange-600">
                        <span>Reste à payer</span>
                        <span>
                          {formatCurrency(
                            parseFloat(invoice.total) -
                              parseFloat(invoice.amountPaid)
                          )}
                        </span>
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

          {/* Payment history */}
          {invoice.payments.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Historique des paiements
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {invoice.payments.map((payment) => (
                    <div
                      key={payment.id}
                      className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                    >
                      <div>
                        <p className="font-medium">
                          {formatCurrency(payment.amount)}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(payment.paidAt)} via{" "}
                          {payment.paymentMethod || "Carte bancaire"}
                        </p>
                      </div>
                      <span className="text-green-600 text-sm font-medium">
                        Confirmé
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Dates */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Dates
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Émission</span>
                <span className="font-medium">
                  {formatDate(invoice.issueDate, {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Échéance</span>
                <span className="font-medium">
                  {formatDate(invoice.dueDate, {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </span>
              </div>
              {invoice.paidAt && (
                <div className="flex justify-between text-green-600">
                  <span>Payée le</span>
                  <span className="font-medium">
                    {formatDate(invoice.paidAt, {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Payment link */}
          {invoice.paymentToken && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ExternalLink className="h-5 w-5" />
                  Lien de paiement
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-3 bg-muted rounded-lg">
                  <code className="text-xs break-all">
                    {process.env.NEXT_PUBLIC_APP_URL}/pay/{invoice.paymentToken}
                  </code>
                </div>
                {invoice.paymentTokenExpiresAt && (
                  <p className="text-sm text-muted-foreground">
                    Expire le{" "}
                    {formatDate(invoice.paymentTokenExpiresAt, {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                )}
                <Button variant="outline" size="sm" className="w-full">
                  <Copy className="h-4 w-4 mr-2" />
                  Copier le lien
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Client info */}
          {invoice.client && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Client
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="font-medium">{invoice.client.companyName}</p>
                  {invoice.client.contactName && (
                    <p className="text-sm text-muted-foreground">
                      {invoice.client.contactName}
                    </p>
                  )}
                </div>
                <Button variant="outline" size="sm" className="w-full" asChild>
                  <Link href={`/clients/${invoice.client.id}`}>
                    <User className="h-4 w-4 mr-2" />
                    Voir le client
                  </Link>
                </Button>
              </CardContent>
            </Card>
          )}

          {/* History */}
          {invoice.history.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Historique
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {invoice.history.map((entry) => (
                    <div key={entry.id} className="flex gap-3 text-sm">
                      <div className="w-2 h-2 rounded-full bg-muted-foreground mt-1.5 flex-shrink-0" />
                      <div>
                        <p>{getHistoryLabel(entry.action)}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(entry.createdAt, {
                            day: "numeric",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

function getHistoryLabel(action: string): string {
  const labels: Record<string, string> = {
    created: "Facture créée",
    status_change: "Statut modifié",
    payment_received: "Paiement reçu",
    payment_link_generated: "Lien de paiement généré",
    sent: "Facture envoyée",
    reminder_sent: "Rappel envoyé",
  };
  return labels[action] || action;
}
