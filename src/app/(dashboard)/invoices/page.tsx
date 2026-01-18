import Link from "next/link";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { invoices, clients } from "@/lib/db/schema";
import { eq, desc, and, gte, lte, or, ilike, sql } from "drizzle-orm";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, FileText } from "lucide-react";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { InvoiceFilters } from "@/components/dashboard/invoice-filters";
import { InvoicesTable } from "@/components/dashboard/invoices-table";
import { redirect } from "next/navigation";

interface SearchParams {
  search?: string;
  status?: string;
  from?: string;
  to?: string;
  page?: string;
}

async function getInvoicesWithStats(
  userId: string,
  searchParams: SearchParams
) {
  const page = parseInt(searchParams.page || "1");
  const pageSize = 20;
  const offset = (page - 1) * pageSize;

  // Build where conditions
  const conditions = [eq(invoices.userId, userId)];

  if (searchParams.status && searchParams.status !== "all") {
    conditions.push(eq(invoices.status, searchParams.status as any));
  }

  if (searchParams.from) {
    conditions.push(gte(invoices.issueDate, new Date(searchParams.from)));
  }

  if (searchParams.to) {
    conditions.push(lte(invoices.issueDate, new Date(searchParams.to)));
  }

  // Get all invoices for stats (without pagination)
  const allInvoices = await db.query.invoices.findMany({
    where: eq(invoices.userId, userId),
    with: { client: true },
  });

  // Get filtered invoices with pagination
  let filteredInvoices = await db.query.invoices.findMany({
    where: and(...conditions),
    with: { client: true },
    orderBy: [desc(invoices.createdAt)],
    limit: pageSize,
    offset,
  });

  // Apply search filter (client-side for simplicity)
  if (searchParams.search) {
    const searchLower = searchParams.search.toLowerCase();
    filteredInvoices = filteredInvoices.filter(
      (inv) =>
        inv.number.toLowerCase().includes(searchLower) ||
        inv.client?.companyName.toLowerCase().includes(searchLower)
    );
  }

  // Get total count for filtered results
  const totalFiltered = await db
    .select({ count: sql<number>`count(*)` })
    .from(invoices)
    .where(and(...conditions));

  const totalCount = Number(totalFiltered[0]?.count || 0);
  const totalPages = Math.ceil(totalCount / pageSize);

  // Calculate stats
  const stats = {
    totalInvoices: allInvoices.length,
    totalAmount: allInvoices.reduce(
      (sum, inv) => sum + parseFloat(inv.total),
      0
    ),
    paidAmount: allInvoices
      .filter((inv) => inv.status === "paid")
      .reduce((sum, inv) => sum + parseFloat(inv.total), 0),
    pendingAmount: allInvoices
      .filter((inv) => inv.status === "sent" || inv.status === "draft")
      .reduce((sum, inv) => sum + parseFloat(inv.total), 0),
    overdueAmount: allInvoices
      .filter((inv) => inv.status === "overdue")
      .reduce((sum, inv) => sum + parseFloat(inv.total), 0),
    overdueCount: allInvoices.filter((inv) => inv.status === "overdue").length,
    paidCount: allInvoices.filter((inv) => inv.status === "paid").length,
    pendingCount: allInvoices.filter(
      (inv) => inv.status === "sent" || inv.status === "draft"
    ).length,
    clientsCount: new Set(allInvoices.map((inv) => inv.clientId)).size,
  };

  return {
    invoices: filteredInvoices,
    stats,
    pagination: {
      currentPage: page,
      totalPages,
      totalCount,
    },
  };
}

export default async function InvoicesPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const params = await searchParams;
  const { invoices: userInvoices, stats, pagination } = await getInvoicesWithStats(
    session.user.id,
    params
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Factures</h2>
          <p className="text-muted-foreground">
            Gérez vos factures et suivez les paiements
          </p>
        </div>
        <Button asChild>
          <Link href="/invoices/new">
            <Plus className="mr-2 h-4 w-4" />
            Nouvelle facture
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <StatsCards stats={stats} />

      {/* Filters */}
      <InvoiceFilters
        initialSearch={params.search}
        initialStatus={params.status}
        initialDateFrom={params.from}
        initialDateTo={params.to}
      />

      {/* Invoices List */}
      {stats.totalInvoices === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground/50" />
            <h3 className="mt-4 text-lg font-semibold">Aucune facture</h3>
            <p className="mt-2 text-center text-muted-foreground max-w-sm">
              Créez votre première facture pour commencer à facturer vos
              clients.
            </p>
            <Button asChild className="mt-6">
              <Link href="/invoices/new">
                <Plus className="mr-2 h-4 w-4" />
                Créer une facture
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <InvoicesTableWrapper
          invoices={userInvoices}
          pagination={pagination}
          searchParams={params}
        />
      )}
    </div>
  );
}

// Client component wrapper for pagination
function InvoicesTableWrapper({
  invoices,
  pagination,
  searchParams,
}: {
  invoices: any[];
  pagination: { currentPage: number; totalPages: number; totalCount: number };
  searchParams: SearchParams;
}) {
  return (
    <InvoicesTable
      invoices={invoices}
      currentPage={pagination.currentPage}
      totalPages={pagination.totalPages}
      totalCount={pagination.totalCount}
      onPageChange={() => {}}
    />
  );
}
