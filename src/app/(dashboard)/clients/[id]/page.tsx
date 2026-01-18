import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { clients, invoices } from "@/lib/db/schema";
import { eq, desc, and, sql } from "drizzle-orm";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ArrowLeft,
  Edit,
  Plus,
  Mail,
  Phone,
  MapPin,
  Building2,
  FileText,
  CreditCard,
  TrendingUp,
  Calendar,
} from "lucide-react";
import { formatCurrency, formatDate, getStatusLabel, getStatusColor } from "@/lib/utils";

async function getClientWithStats(clientId: string, userId: string) {
  const client = await db.query.clients.findFirst({
    where: and(eq(clients.id, clientId), eq(clients.userId, userId)),
  });

  if (!client) return null;

  // Get invoices for this client
  const clientInvoices = await db.query.invoices.findMany({
    where: eq(invoices.clientId, clientId),
    orderBy: [desc(invoices.createdAt)],
  });

  // Calculate stats
  const totalInvoiced = clientInvoices.reduce(
    (sum, inv) => sum + parseFloat(inv.total),
    0
  );
  const paidInvoices = clientInvoices.filter(
    (inv) => inv.status === "paid" || inv.status === "partially_paid"
  );
  const totalPaid = paidInvoices.reduce(
    (sum, inv) => sum + parseFloat(inv.amountPaid),
    0
  );
  const paymentRate =
    totalInvoiced > 0 ? Math.round((totalPaid / totalInvoiced) * 100) : 0;

  return {
    client,
    invoices: clientInvoices,
    stats: {
      totalInvoices: clientInvoices.length,
      totalInvoiced,
      totalPaid,
      paymentRate,
      paidInvoicesCount: paidInvoices.length,
    },
  };
}

export default async function ClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const { id } = await params;
  const data = await getClientWithStats(id, session.user.id);

  if (!data) {
    notFound();
  }

  const { client, invoices: clientInvoices, stats } = data;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/clients">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour
            </Link>
          </Button>
          <div className="h-6 w-px bg-border" />
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Building2 className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">{client.companyName}</h2>
              {client.contactName && (
                <p className="text-muted-foreground">
                  {client.contactName}
                  {client.contactTitle && ` - ${client.contactTitle}`}
                </p>
              )}
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href={`/clients/${client.id}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              Modifier
            </Link>
          </Button>
          <Button asChild>
            <Link href={`/invoices/new?client=${client.id}`}>
              <Plus className="mr-2 h-4 w-4" />
              Nouvelle facture
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total facturé
            </CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(stats.totalInvoiced)}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.totalInvoices} facture{stats.totalInvoices > 1 ? "s" : ""}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total payé</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(stats.totalPaid)}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.paidInvoicesCount} facture{stats.paidInvoicesCount > 1 ? "s" : ""} payée{stats.paidInvoicesCount > 1 ? "s" : ""}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Taux de paiement
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.paymentRate}%</div>
            <div className="w-full bg-muted rounded-full h-2 mt-2">
              <div
                className="bg-green-500 h-2 rounded-full transition-all"
                style={{ width: `${stats.paymentRate}%` }}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Client depuis</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatDate(client.createdAt, {
                month: "short",
                year: "numeric",
              })}
            </div>
            <p className="text-xs text-muted-foreground">
              {Math.floor(
                (Date.now() - new Date(client.createdAt).getTime()) /
                  (1000 * 60 * 60 * 24)
              )}{" "}
              jours
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Client info */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Informations</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {client.email && (
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <a
                  href={`mailto:${client.email}`}
                  className="text-sm hover:underline"
                >
                  {client.email}
                </a>
              </div>
            )}
            {client.phone && (
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <a
                  href={`tel:${client.phone}`}
                  className="text-sm hover:underline"
                >
                  {client.phone}
                </a>
              </div>
            )}
            {(client.address || client.city) && (
              <div className="flex items-start gap-3">
                <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div className="text-sm">
                  {client.address && <p>{client.address}</p>}
                  <p>
                    {client.postalCode} {client.city}
                  </p>
                  {client.country && <p>{client.country}</p>}
                </div>
              </div>
            )}

            {(client.siret || client.siren) && (
              <div className="pt-4 border-t space-y-2">
                {client.siret && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">SIRET</span>
                    <span className="font-mono">{client.siret}</span>
                  </div>
                )}
                {client.siren && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">SIREN</span>
                    <span className="font-mono">{client.siren}</span>
                  </div>
                )}
                {client.vatNumber && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">TVA Intra.</span>
                    <span className="font-mono">{client.vatNumber}</span>
                  </div>
                )}
              </div>
            )}

            {client.notes && (
              <div className="pt-4 border-t">
                <p className="text-sm text-muted-foreground mb-1">Notes</p>
                <p className="text-sm whitespace-pre-wrap">{client.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Invoices history */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Historique des factures</CardTitle>
            <Button variant="outline" size="sm" asChild>
              <Link href={`/invoices/new?client=${client.id}`}>
                <Plus className="mr-2 h-4 w-4" />
                Nouvelle
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {clientInvoices.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Aucune facture pour ce client</p>
                <Button asChild className="mt-4">
                  <Link href={`/invoices/new?client=${client.id}`}>
                    Créer la première facture
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="rounded-lg border">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="px-4 py-3 text-left text-sm font-medium">
                        N°
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium">
                        Date
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium">
                        Montant
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium">
                        Statut
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {clientInvoices.map((invoice) => {
                      const statusColor = getStatusColor(invoice.status);
                      return (
                        <tr
                          key={invoice.id}
                          className="border-b last:border-0 hover:bg-muted/50 transition-colors"
                        >
                          <td className="px-4 py-3 text-sm font-medium">
                            {invoice.number}
                          </td>
                          <td className="px-4 py-3 text-sm text-muted-foreground">
                            {formatDate(invoice.issueDate, {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </td>
                          <td className="px-4 py-3 text-sm font-medium">
                            {formatCurrency(invoice.total)}
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusColor.bg} ${statusColor.text}`}
                            >
                              {getStatusLabel(invoice.status)}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <Button asChild variant="ghost" size="sm">
                              <Link href={`/invoices/${invoice.id}`}>Voir</Link>
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
