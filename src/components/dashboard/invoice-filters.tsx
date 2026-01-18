"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, X, Filter } from "lucide-react";

const STATUS_OPTIONS = [
  { value: "all", label: "Tous les statuts" },
  { value: "draft", label: "Brouillon" },
  { value: "sent", label: "Envoyée" },
  { value: "paid", label: "Payée" },
  { value: "overdue", label: "En retard" },
  { value: "partially_paid", label: "Partiellement payée" },
  { value: "disputed", label: "Litige" },
  { value: "cancelled", label: "Annulée" },
];

interface InvoiceFiltersProps {
  initialSearch?: string;
  initialStatus?: string;
  initialDateFrom?: string;
  initialDateTo?: string;
}

export function InvoiceFilters({
  initialSearch = "",
  initialStatus = "all",
  initialDateFrom = "",
  initialDateTo = "",
}: InvoiceFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [search, setSearch] = useState(initialSearch);
  const [status, setStatus] = useState(initialStatus);
  const [dateFrom, setDateFrom] = useState(initialDateFrom);
  const [dateTo, setDateTo] = useState(initialDateTo);

  const applyFilters = () => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (status && status !== "all") params.set("status", status);
    if (dateFrom) params.set("from", dateFrom);
    if (dateTo) params.set("to", dateTo);

    router.push(`/invoices?${params.toString()}`);
  };

  const resetFilters = () => {
    setSearch("");
    setStatus("all");
    setDateFrom("");
    setDateTo("");
    router.push("/invoices");
  };

  const hasFilters = search || status !== "all" || dateFrom || dateTo;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher par numéro ou client..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && applyFilters()}
            className="pl-9"
          />
        </div>

        {/* Status filter */}
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Statut" />
          </SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Date from */}
        <Input
          type="date"
          value={dateFrom}
          onChange={(e) => setDateFrom(e.target.value)}
          className="w-[150px]"
          placeholder="Date début"
        />

        {/* Date to */}
        <Input
          type="date"
          value={dateTo}
          onChange={(e) => setDateTo(e.target.value)}
          className="w-[150px]"
          placeholder="Date fin"
        />

        {/* Apply button */}
        <Button onClick={applyFilters}>
          <Filter className="h-4 w-4 mr-2" />
          Filtrer
        </Button>

        {/* Reset button */}
        {hasFilters && (
          <Button variant="outline" onClick={resetFilters}>
            <X className="h-4 w-4 mr-2" />
            Réinitialiser
          </Button>
        )}
      </div>

      {hasFilters && (
        <div className="text-sm text-muted-foreground">
          Filtres actifs:{" "}
          {[
            search && `"${search}"`,
            status !== "all" &&
              STATUS_OPTIONS.find((s) => s.value === status)?.label,
            dateFrom && `à partir du ${dateFrom}`,
            dateTo && `jusqu'au ${dateTo}`,
          ]
            .filter(Boolean)
            .join(", ")}
        </div>
      )}
    </div>
  );
}
