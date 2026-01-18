"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { InvoiceItems, type InvoiceItemData } from "./invoice-items";
import { InvoiceTotals } from "./invoice-totals";
import { ArrowLeft, Loader2, Save, FileText, User, Calendar, Building2 } from "lucide-react";
import type { Client, Template } from "@/types";

interface InvoiceFormProps {
  clients: Client[];
  templates: Template[];
  defaultValues?: {
    clientId?: string;
    templateId?: string;
    invoiceNumber: string;
    defaultTaxRate: number;
    defaultMessage?: string;
  };
}

export function InvoiceForm({
  clients,
  templates,
  defaultValues,
}: InvoiceFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [clientId, setClientId] = useState(defaultValues?.clientId || "");
  const [templateId, setTemplateId] = useState(defaultValues?.templateId || "");
  const [invoiceNumber, setInvoiceNumber] = useState(
    defaultValues?.invoiceNumber || ""
  );
  const [issueDate, setIssueDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [dueDate, setDueDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() + 30);
    return date.toISOString().split("T")[0];
  });
  const [taxRate, setTaxRate] = useState(defaultValues?.defaultTaxRate || 20);
  const [message, setMessage] = useState(defaultValues?.defaultMessage || "");
  const [items, setItems] = useState<InvoiceItemData[]>([
    {
      id: crypto.randomUUID(),
      name: "",
      description: "",
      quantity: 1,
      unitPrice: 0,
    },
  ]);

  const calculateTotals = () => {
    const subtotal = items.reduce(
      (sum, item) => sum + item.quantity * item.unitPrice,
      0
    );
    const taxAmount = subtotal * (taxRate / 100);
    const total = subtotal + taxAmount;
    return { subtotal, taxAmount, total };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!clientId) {
      setError("Veuillez sélectionner un client");
      return;
    }

    if (items.length === 0 || items.every((item) => !item.name)) {
      setError("Veuillez ajouter au moins une ligne de service");
      return;
    }

    const validItems = items.filter((item) => item.name.trim() !== "");
    if (validItems.length === 0) {
      setError("Veuillez ajouter au moins une ligne de service valide");
      return;
    }

    setIsSubmitting(true);

    try {
      const { subtotal, taxAmount, total } = calculateTotals();

      const response = await fetch("/api/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId,
          templateId: templateId || null,
          number: invoiceNumber,
          issueDate,
          dueDate,
          taxRate,
          subtotal,
          taxAmount,
          total,
          message,
          items: validItems.map((item, index) => ({
            name: item.name,
            description: item.description || null,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            total: item.quantity * item.unitPrice,
            sortOrder: index,
          })),
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Erreur lors de la création");
      }

      const { data: invoice } = await response.json();
      router.push(`/invoices/${invoice.id}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/invoices">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour
            </Link>
          </Button>
          <div className="h-6 w-px bg-border" />
          <div>
            <h2 className="text-2xl font-bold">Nouvelle facture</h2>
            <p className="text-sm text-muted-foreground">
              Créez une facture pour votre client
            </p>
          </div>
        </div>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Save className="mr-2 h-4 w-4" />
          )}
          Créer la facture
        </Button>
      </div>

      {error && (
        <div className="p-4 bg-destructive/10 text-destructive rounded-lg">
          {error}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Client selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Client
              </CardTitle>
            </CardHeader>
            <CardContent>
              {clients.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-muted-foreground mb-4">
                    Aucun client enregistré
                  </p>
                  <Button asChild variant="outline">
                    <Link href="/clients/new">Ajouter un client</Link>
                  </Button>
                </div>
              ) : (
                <Select value={clientId} onValueChange={setClientId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez un client" />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map((client) => (
                      <SelectItem key={client.id} value={client.id}>
                        <div className="flex flex-col">
                          <span>{client.companyName}</span>
                          {client.contactName && (
                            <span className="text-xs text-muted-foreground">
                              {client.contactName}
                            </span>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </CardContent>
          </Card>

          {/* Invoice items */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Services
              </CardTitle>
            </CardHeader>
            <CardContent>
              <InvoiceItems items={items} onChange={setItems} />
            </CardContent>
          </Card>

          {/* Message */}
          <Card>
            <CardHeader>
              <CardTitle>Message personnalisé</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Ajoutez un message ou des informations complémentaires..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={3}
              />
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Invoice details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Détails
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="invoiceNumber">Numéro de facture</Label>
                <Input
                  id="invoiceNumber"
                  value={invoiceNumber}
                  onChange={(e) => setInvoiceNumber(e.target.value)}
                  placeholder="FAC-2026-0001"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="issueDate">Date d&apos;émission</Label>
                <Input
                  id="issueDate"
                  type="date"
                  value={issueDate}
                  onChange={(e) => setIssueDate(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dueDate">Date d&apos;échéance</Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                />
              </div>

              {templates.length > 0 && (
                <div className="space-y-2">
                  <Label htmlFor="template">Template</Label>
                  <Select value={templateId} onValueChange={setTemplateId}>
                    <SelectTrigger id="template">
                      <SelectValue placeholder="Sélectionnez un template" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Aucun template</SelectItem>
                      {templates.map((template) => (
                        <SelectItem key={template.id} value={template.id}>
                          {template.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Totals */}
          <InvoiceTotals
            items={items}
            taxRate={taxRate}
            onTaxRateChange={setTaxRate}
          />
        </div>
      </div>
    </form>
  );
}
