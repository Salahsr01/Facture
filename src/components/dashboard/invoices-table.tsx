"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  MoreHorizontal,
  Eye,
  Edit,
  Copy,
  Send,
  Download,
  Trash2,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { formatCurrency, formatDate, getStatusLabel, getStatusColor } from "@/lib/utils";
import type { Invoice, Client } from "@/types";

interface InvoiceWithClient extends Invoice {
  client: Client | null;
}

interface InvoicesTableProps {
  invoices: InvoiceWithClient[];
  currentPage: number;
  totalPages: number;
  totalCount: number;
  onPageChange: (page: number) => void;
}

export function InvoicesTable({
  invoices,
  currentPage,
  totalPages,
  totalCount,
  onPageChange,
}: InvoicesTableProps) {
  return (
    <div className="space-y-4">
      <div className="rounded-lg border">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="px-4 py-3 text-left text-sm font-medium">N°</th>
                <th className="px-4 py-3 text-left text-sm font-medium">
                  Client
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium">
                  Date
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium">
                  Échéance
                </th>
                <th className="px-4 py-3 text-right text-sm font-medium">
                  Montant
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium">
                  Statut
                </th>
                <th className="px-4 py-3 text-right text-sm font-medium">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {invoices.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-8 text-center text-muted-foreground"
                  >
                    Aucune facture trouvée
                  </td>
                </tr>
              ) : (
                invoices.map((invoice) => {
                  const statusColor = getStatusColor(invoice.status);
                  const isOverdue =
                    invoice.status !== "paid" &&
                    invoice.status !== "cancelled" &&
                    new Date(invoice.dueDate) < new Date();

                  return (
                    <tr
                      key={invoice.id}
                      className="border-b hover:bg-muted/50 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <Link
                          href={`/invoices/${invoice.id}`}
                          className="font-medium hover:underline"
                        >
                          {invoice.number}
                        </Link>
                      </td>
                      <td className="px-4 py-3">
                        {invoice.client ? (
                          <Link
                            href={`/clients/${invoice.client.id}`}
                            className="hover:underline"
                          >
                            {invoice.client.companyName}
                          </Link>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">
                        {formatDate(invoice.issueDate, {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                      <td
                        className={`px-4 py-3 text-sm ${
                          isOverdue
                            ? "text-red-600 font-medium"
                            : "text-muted-foreground"
                        }`}
                      >
                        {formatDate(invoice.dueDate, {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                      <td className="px-4 py-3 text-right font-medium">
                        {formatCurrency(invoice.total)}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusColor.bg} ${statusColor.text}`}
                        >
                          {getStatusLabel(invoice.status)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <InvoiceActions invoice={invoice} />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Affichage de {(currentPage - 1) * 20 + 1} à{" "}
            {Math.min(currentPage * 20, totalCount)} sur {totalCount} factures
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage <= 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm">
              Page {currentPage} sur {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage >= totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function InvoiceActions({ invoice }: { invoice: InvoiceWithClient }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem asChild>
          <Link href={`/invoices/${invoice.id}`}>
            <Eye className="h-4 w-4 mr-2" />
            Voir
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href={`/invoices/${invoice.id}/edit`}>
            <Edit className="h-4 w-4 mr-2" />
            Modifier
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Copy className="h-4 w-4 mr-2" />
          Dupliquer
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        {invoice.status === "draft" && (
          <DropdownMenuItem>
            <Send className="h-4 w-4 mr-2" />
            Envoyer
          </DropdownMenuItem>
        )}
        {invoice.paymentToken && (
          <DropdownMenuItem>
            <ExternalLink className="h-4 w-4 mr-2" />
            Lien de paiement
          </DropdownMenuItem>
        )}
        <DropdownMenuItem>
          <Download className="h-4 w-4 mr-2" />
          Télécharger PDF
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="text-destructive">
          <Trash2 className="h-4 w-4 mr-2" />
          Supprimer
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
