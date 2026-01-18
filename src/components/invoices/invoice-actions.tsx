"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Edit,
  Send,
  Download,
  Link as LinkIcon,
  MoreHorizontal,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Copy,
  Trash2,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

type InvoiceStatus =
  | "draft"
  | "sent"
  | "paid"
  | "overdue"
  | "partially_paid"
  | "disputed"
  | "cancelled";

interface Invoice {
  id: string;
  number: string;
  status: InvoiceStatus;
  paymentToken?: string | null;
  total: string;
}

interface InvoiceActionsProps {
  invoice: Invoice;
}

const statusOptions: {
  value: InvoiceStatus;
  label: string;
  icon: typeof CheckCircle;
}[] = [
  { value: "draft", label: "Brouillon", icon: Clock },
  { value: "sent", label: "Envoyée", icon: Send },
  { value: "paid", label: "Payée", icon: CheckCircle },
  { value: "overdue", label: "En retard", icon: AlertTriangle },
  { value: "partially_paid", label: "Partiellement payée", icon: Clock },
  { value: "disputed", label: "Contestée", icon: AlertTriangle },
  { value: "cancelled", label: "Annulée", icon: XCircle },
];

export function InvoiceActions({ invoice }: InvoiceActionsProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showPaymentLinkDialog, setShowPaymentLinkDialog] = useState(false);
  const [paymentLink, setPaymentLink] = useState<string | null>(null);

  const handleStatusChange = async (newStatus: InvoiceStatus) => {
    if (newStatus === invoice.status) return;

    setIsLoading(true);
    try {
      const response = await fetch(`/api/invoices/${invoice.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Erreur lors de la mise à jour");
      }

      toast.success("Statut mis à jour");
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Erreur lors de la mise à jour"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleGeneratePaymentLink = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/invoices/${invoice.id}/payment-link`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ expiresInDays: 30 }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Erreur lors de la génération");
      }

      const data = await response.json();
      setPaymentLink(data.data.paymentUrl);
      setShowPaymentLinkDialog(true);
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Erreur lors de la génération"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyPaymentLink = async () => {
    if (!paymentLink) return;

    try {
      await navigator.clipboard.writeText(paymentLink);
      toast.success("Lien copié dans le presse-papier");
    } catch {
      toast.error("Impossible de copier le lien");
    }
  };

  const handleDelete = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/invoices/${invoice.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Erreur lors de la suppression");
      }

      toast.success("Facture supprimée");
      router.push("/invoices");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Erreur lors de la suppression"
      );
    } finally {
      setIsLoading(false);
      setShowDeleteDialog(false);
    }
  };

  const handleDownloadPdf = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/invoices/${invoice.id}/pdf`);

      if (!response.ok) {
        throw new Error("Erreur lors de la génération du PDF");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `facture-${invoice.number}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success("PDF téléchargé");
    } catch {
      toast.error("Erreur lors du téléchargement du PDF");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="flex items-center gap-2">
        {/* Quick actions */}
        {invoice.status === "draft" && (
          <Button variant="outline" size="sm" asChild>
            <Link href={`/invoices/${invoice.id}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              Modifier
            </Link>
          </Button>
        )}

        {(invoice.status === "draft" || invoice.status === "sent") && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleGeneratePaymentLink}
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <LinkIcon className="mr-2 h-4 w-4" />
            )}
            Lien de paiement
          </Button>
        )}

        <Button
          variant="outline"
          size="sm"
          onClick={handleDownloadPdf}
          disabled={isLoading}
        >
          {isLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Download className="mr-2 h-4 w-4" />
          )}
          PDF
        </Button>

        {/* More actions dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <Clock className="mr-2 h-4 w-4" />
                Changer le statut
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                {statusOptions.map((option) => (
                  <DropdownMenuItem
                    key={option.value}
                    onClick={() => handleStatusChange(option.value)}
                    disabled={option.value === invoice.status || isLoading}
                  >
                    <option.icon className="mr-2 h-4 w-4" />
                    {option.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuSubContent>
            </DropdownMenuSub>

            <DropdownMenuSeparator />

            {invoice.status === "draft" && (
              <DropdownMenuItem
                onClick={() => handleStatusChange("sent")}
                disabled={isLoading}
              >
                <Send className="mr-2 h-4 w-4" />
                Marquer comme envoyée
              </DropdownMenuItem>
            )}

            {(invoice.status === "sent" || invoice.status === "overdue") && (
              <DropdownMenuItem
                onClick={() => handleStatusChange("paid")}
                disabled={isLoading}
              >
                <CheckCircle className="mr-2 h-4 w-4" />
                Marquer comme payée
              </DropdownMenuItem>
            )}

            <DropdownMenuSeparator />

            {invoice.status === "draft" && (
              <DropdownMenuItem
                onClick={() => setShowDeleteDialog(true)}
                className="text-red-600 focus:text-red-600"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Supprimer
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Delete confirmation dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Supprimer la facture ?</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer la facture {invoice.number} ?
              Cette action est irréversible.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
            >
              Annuler
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isLoading}
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Payment link dialog */}
      <Dialog
        open={showPaymentLinkDialog}
        onOpenChange={setShowPaymentLinkDialog}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Lien de paiement généré</DialogTitle>
            <DialogDescription>
              Partagez ce lien avec votre client pour qu&apos;il puisse payer la
              facture en ligne.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-3 bg-muted rounded-lg">
              <code className="text-sm break-all">{paymentLink}</code>
            </div>
            <p className="text-sm text-muted-foreground">
              Ce lien expire dans 30 jours.
            </p>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowPaymentLinkDialog(false)}
            >
              Fermer
            </Button>
            <Button onClick={handleCopyPaymentLink}>
              <Copy className="mr-2 h-4 w-4" />
              Copier le lien
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
