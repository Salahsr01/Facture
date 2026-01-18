import Link from "next/link";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { invoices } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, FileText } from "lucide-react";
import { formatCurrency, formatDate, getStatusLabel, getStatusColor } from "@/lib/utils";

async function getInvoices(userId: string) {
  try {
    return await db.query.invoices.findMany({
      where: eq(invoices.userId, userId),
      with: {
        client: true,
      },
      orderBy: [desc(invoices.createdAt)],
    });
  } catch {
    return [];
  }
}

export default async function InvoicesPage() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const userInvoices = await getInvoices(session.user.id);

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

      {/* Invoices List */}
      {userInvoices.length === 0 ? (
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
        <div className="rounded-lg border">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="px-4 py-3 text-left text-sm font-medium">
                    N°
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium">
                    Client
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium">
                    Date
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium">
                    Échéance
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
                {userInvoices.map((invoice) => {
                  const statusColor = getStatusColor(invoice.status);
                  return (
                    <tr
                      key={invoice.id}
                      className="border-b hover:bg-muted/50 transition-colors"
                    >
                      <td className="px-4 py-3 text-sm font-medium">
                        {invoice.number}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {invoice.client?.companyName || "—"}
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">
                        {formatDate(invoice.issueDate)}
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">
                        {formatDate(invoice.dueDate)}
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
        </div>
      )}
    </div>
  );
}
