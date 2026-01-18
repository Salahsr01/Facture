"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2, GripVertical } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export interface InvoiceItemData {
  id: string;
  name: string;
  description: string;
  quantity: number;
  unitPrice: number;
}

interface InvoiceItemsProps {
  items: InvoiceItemData[];
  onChange: (items: InvoiceItemData[]) => void;
}

export function InvoiceItems({ items, onChange }: InvoiceItemsProps) {
  const addItem = () => {
    const newItem: InvoiceItemData = {
      id: crypto.randomUUID(),
      name: "",
      description: "",
      quantity: 1,
      unitPrice: 0,
    };
    onChange([...items, newItem]);
  };

  const removeItem = (id: string) => {
    onChange(items.filter((item) => item.id !== id));
  };

  const updateItem = (id: string, field: keyof InvoiceItemData, value: string | number) => {
    onChange(
      items.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  };

  const calculateLineTotal = (item: InvoiceItemData): number => {
    return item.quantity * item.unitPrice;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Lignes de services</h3>
        <Button type="button" variant="outline" size="sm" onClick={addItem}>
          <Plus className="h-4 w-4 mr-2" />
          Ajouter une ligne
        </Button>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-8 border-2 border-dashed rounded-lg">
          <p className="text-muted-foreground mb-4">
            Aucune ligne de service
          </p>
          <Button type="button" variant="outline" onClick={addItem}>
            <Plus className="h-4 w-4 mr-2" />
            Ajouter la première ligne
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Header */}
          <div className="grid grid-cols-[1fr_2fr_100px_120px_100px_40px] gap-2 px-2 text-sm font-medium text-muted-foreground">
            <div>Service</div>
            <div>Description</div>
            <div className="text-right">Quantité</div>
            <div className="text-right">Prix unitaire</div>
            <div className="text-right">Total</div>
            <div></div>
          </div>

          {/* Items */}
          {items.map((item, index) => (
            <div
              key={item.id}
              className="grid grid-cols-[1fr_2fr_100px_120px_100px_40px] gap-2 items-start p-2 bg-muted/30 rounded-lg"
            >
              <Input
                placeholder="Nom du service"
                value={item.name}
                onChange={(e) => updateItem(item.id, "name", e.target.value)}
              />
              <Input
                placeholder="Description (optionnel)"
                value={item.description}
                onChange={(e) => updateItem(item.id, "description", e.target.value)}
              />
              <Input
                type="number"
                min="0"
                step="0.5"
                className="text-right"
                value={item.quantity || ""}
                onChange={(e) =>
                  updateItem(item.id, "quantity", parseFloat(e.target.value) || 0)
                }
              />
              <Input
                type="number"
                min="0"
                step="0.01"
                className="text-right"
                value={item.unitPrice || ""}
                onChange={(e) =>
                  updateItem(item.id, "unitPrice", parseFloat(e.target.value) || 0)
                }
              />
              <div className="h-10 flex items-center justify-end px-3 bg-muted rounded-md font-medium">
                {formatCurrency(calculateLineTotal(item))}
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="text-destructive hover:text-destructive"
                onClick={() => removeItem(item.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
