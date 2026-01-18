"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type InvoiceStatus =
  | "draft"
  | "sent"
  | "paid"
  | "overdue"
  | "partially_paid"
  | "disputed"
  | "cancelled";

interface InvoiceStatusBadgeProps {
  status: InvoiceStatus;
  className?: string;
}

const statusConfig: Record<
  InvoiceStatus,
  { label: string; variant: string; className: string }
> = {
  draft: {
    label: "Brouillon",
    variant: "secondary",
    className: "bg-gray-100 text-gray-700 hover:bg-gray-100",
  },
  sent: {
    label: "Envoyée",
    variant: "default",
    className: "bg-blue-100 text-blue-700 hover:bg-blue-100",
  },
  paid: {
    label: "Payée",
    variant: "default",
    className: "bg-green-100 text-green-700 hover:bg-green-100",
  },
  overdue: {
    label: "En retard",
    variant: "destructive",
    className: "bg-red-100 text-red-700 hover:bg-red-100",
  },
  partially_paid: {
    label: "Partiellement payée",
    variant: "default",
    className: "bg-orange-100 text-orange-700 hover:bg-orange-100",
  },
  disputed: {
    label: "Contestée",
    variant: "default",
    className: "bg-yellow-100 text-yellow-700 hover:bg-yellow-100",
  },
  cancelled: {
    label: "Annulée",
    variant: "secondary",
    className: "bg-gray-200 text-gray-500 hover:bg-gray-200",
  },
};

export function InvoiceStatusBadge({
  status,
  className,
}: InvoiceStatusBadgeProps) {
  const config = statusConfig[status] || statusConfig.draft;

  return (
    <Badge className={cn(config.className, className)}>{config.label}</Badge>
  );
}
