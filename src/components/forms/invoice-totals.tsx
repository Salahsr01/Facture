"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { formatCurrency } from "@/lib/utils";
import type { InvoiceItemData } from "./invoice-items";

const TAX_RATES = [
  { value: "0", label: "0% (Exonéré)" },
  { value: "5.5", label: "5,5% (Taux réduit)" },
  { value: "10", label: "10% (Taux intermédiaire)" },
  { value: "20", label: "20% (Taux normal)" },
];

interface InvoiceTotalsProps {
  items: InvoiceItemData[];
  taxRate: number;
  onTaxRateChange: (rate: number) => void;
}

export function InvoiceTotals({
  items,
  taxRate,
  onTaxRateChange,
}: InvoiceTotalsProps) {
  // Calculate totals
  const subtotal = items.reduce(
    (sum, item) => sum + item.quantity * item.unitPrice,
    0
  );
  const taxAmount = subtotal * (taxRate / 100);
  const total = subtotal + taxAmount;

  return (
    <div className="space-y-4 border rounded-lg p-4 bg-muted/30">
      <h3 className="text-lg font-medium">Totaux</h3>

      <div className="space-y-3">
        {/* Subtotal */}
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Sous-total HT</span>
          <span className="font-medium">{formatCurrency(subtotal)}</span>
        </div>

        {/* Tax Rate Selector */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Label htmlFor="tax-rate" className="text-muted-foreground">
              Taux de TVA
            </Label>
            <Select
              value={String(taxRate)}
              onValueChange={(value) => onTaxRateChange(parseFloat(value))}
            >
              <SelectTrigger id="tax-rate" className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TAX_RATES.map((rate) => (
                  <SelectItem key={rate.value} value={rate.value}>
                    {rate.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <span className="font-medium">{formatCurrency(taxAmount)}</span>
        </div>

        {/* Total */}
        <div className="flex items-center justify-between pt-3 border-t">
          <span className="text-lg font-semibold">Total TTC</span>
          <span className="text-xl font-bold text-primary">
            {formatCurrency(total)}
          </span>
        </div>
      </div>
    </div>
  );
}
