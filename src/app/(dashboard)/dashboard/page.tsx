import Link from "next/link";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { invoices, clients, templates } from "@/lib/db/schema";
import { eq, sql, and, gte } from "drizzle-orm";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  FileText,
  Users,
  LayoutTemplate,
  Euro,
  Clock,
  CheckCircle,
  AlertCircle,
  Plus,
  ArrowRight,
} from "lucide-react";
import { formatCurrency, getStatusLabel, getStatusColor } from "@/lib/utils";

async function getDashboardStats(userId: string) {
  // Get invoice counts by status
  const invoiceStats = await db
    .select({
      status: invoices.status,
      count: sql<number>`count(*)::int`,
      total: sql<number>`sum(${invoices.total})::numeric`,
    })
    .from(invoices)
    .where(eq(invoices.userId, userId))
    .groupBy(invoices.status);

  // Get client count
  const [clientCount] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(clients)
    .where(eq(clients.userId, userId));

  // Get template count
  const [templateCount] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(templates)
    .where(eq(templates.userId, userId));

  // Get recent invoices
  const recentInvoices = await db.query.invoices.findMany({
    where: eq(invoices.userId, userId),
    with: {
      client: true,
    },
    orderBy: (invoices, { desc }) => [desc(invoices.createdAt)],
    limit: 5,
  });

  // Calculate totals
  const totalInvoices = invoiceStats.reduce((sum, s) => sum + s.count, 0);
  const totalAmount = invoiceStats.reduce(
    (sum, s) => sum + (Number(s.total) || 0),
    0
  );
  const paidAmount = invoiceStats
    .filter((s) => s.status === "paid")
    .reduce((sum, s) => sum + (Number(s.total) || 0), 0);
  const pendingAmount = invoiceStats
    .filter((s) => ["sent", "overdue", "partially_paid"].includes(s.status))
    .reduce((sum, s) => sum + (Number(s.total) || 0), 0);

  return {
    invoiceStats: {
      total: totalInvoices,
      draft: invoiceStats.find((s) => s.status === "draft")?.count || 0,
      sent: invoiceStats.find((s) => s.status === "sent")?.count || 0,
      paid: invoiceStats.find((s) => s.status === "paid")?.count || 0,
      overdue: invoiceStats.find((s) => s.status === "overdue")?.count || 0,
    },
    amounts: {
      total: totalAmount,
      paid: paidAmount,
      pending: pendingAmount,
    },
    clientCount: clientCount?.count || 0,
    templateCount: templateCount?.count || 0,
    recentInvoices,
  };
}

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) return null;

  let stats;
  try {
    stats = await getDashboardStats(session.user.id);
  } catch {
    // Database not yet set up - show empty state
    stats = {
      invoiceStats: { total: 0, draft: 0, sent: 0, paid: 0, overdue: 0 },
      amounts: { total: 0, paid: 0, pending: 0 },
      clientCount: 0,
      templateCount: 0,
      recentInvoices: [],
    };
  }

  return (
    <div className="space-y-6">
      {/* Welcome message */}
      <div>
        <h2 className="text-2xl font-bold">
          Bonjour, {session.user.name?.split(" ")[0]} !
        </h2>
        <p className="text-muted-foreground">
          Voici un aperçu de votre activité
        </p>
      </div>

      {/* Stats cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Total facturé
            </CardTitle>
            <Euro className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(stats.amounts.total)}
            </div>
            <p className="text-xs text-muted-foreground">
              sur {stats.invoiceStats.total} factures
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Payé</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(stats.amounts.paid)}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.invoiceStats.paid} factures payées
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">En attente</CardTitle>
            <Clock className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {formatCurrency(stats.amounts.pending)}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.invoiceStats.sent} factures envoyées
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">En retard</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {stats.invoiceStats.overdue}
            </div>
            <p className="text-xs text-muted-foreground">
              factures en retard
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Factures</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.invoiceStats.total}
            </div>
            <div className="mt-2 flex gap-2">
              <Button asChild size="sm" variant="outline">
                <Link href="/invoices">
                  Voir tout
                  <ArrowRight className="ml-1 h-3 w-3" />
                </Link>
              </Button>
              <Button asChild size="sm">
                <Link href="/invoices/new">
                  <Plus className="mr-1 h-3 w-3" />
                  Créer
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Clients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.clientCount}</div>
            <div className="mt-2 flex gap-2">
              <Button asChild size="sm" variant="outline">
                <Link href="/clients">
                  Voir tout
                  <ArrowRight className="ml-1 h-3 w-3" />
                </Link>
              </Button>
              <Button asChild size="sm">
                <Link href="/clients/new">
                  <Plus className="mr-1 h-3 w-3" />
                  Ajouter
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Templates</CardTitle>
            <LayoutTemplate className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.templateCount}</div>
            <div className="mt-2 flex gap-2">
              <Button asChild size="sm" variant="outline">
                <Link href="/templates">
                  Voir tout
                  <ArrowRight className="ml-1 h-3 w-3" />
                </Link>
              </Button>
              <Button asChild size="sm">
                <Link href="/templates/new">
                  <Plus className="mr-1 h-3 w-3" />
                  Importer
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent invoices */}
      <Card>
        <CardHeader>
          <CardTitle>Factures récentes</CardTitle>
          <CardDescription>
            Vos 5 dernières factures créées
          </CardDescription>
        </CardHeader>
        <CardContent>
          {stats.recentInvoices.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="mx-auto h-12 w-12 text-muted-foreground/50" />
              <p className="mt-2 text-muted-foreground">
                Aucune facture pour le moment
              </p>
              <Button asChild className="mt-4">
                <Link href="/invoices/new">
                  <Plus className="mr-2 h-4 w-4" />
                  Créer votre première facture
                </Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {stats.recentInvoices.map((invoice) => {
                const statusColor = getStatusColor(invoice.status);
                return (
                  <Link
                    key={invoice.id}
                    href={`/invoices/${invoice.id}`}
                    className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div>
                        <p className="font-medium">{invoice.number}</p>
                        <p className="text-sm text-muted-foreground">
                          {invoice.client?.companyName}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${statusColor.bg} ${statusColor.text}`}
                      >
                        {getStatusLabel(invoice.status)}
                      </span>
                      <span className="font-medium">
                        {formatCurrency(invoice.total)}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
