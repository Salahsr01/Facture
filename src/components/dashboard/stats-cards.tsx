"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  FileText,
  CreditCard,
  Clock,
  AlertTriangle,
  TrendingUp,
  Users,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface StatsCardsProps {
  stats: {
    totalInvoices: number;
    totalAmount: number;
    paidAmount: number;
    pendingAmount: number;
    overdueAmount: number;
    overdueCount: number;
    paidCount: number;
    pendingCount: number;
    clientsCount: number;
  };
}

export function StatsCards({ stats }: StatsCardsProps) {
  const paymentRate =
    stats.totalAmount > 0
      ? Math.round((stats.paidAmount / stats.totalAmount) * 100)
      : 0;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total facturé</CardTitle>
          <FileText className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatCurrency(stats.totalAmount)}
          </div>
          <p className="text-xs text-muted-foreground">
            {stats.totalInvoices} facture{stats.totalInvoices > 1 ? "s" : ""}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Encaissé</CardTitle>
          <CreditCard className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">
            {formatCurrency(stats.paidAmount)}
          </div>
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-muted rounded-full h-2">
              <div
                className="bg-green-500 h-2 rounded-full transition-all"
                style={{ width: `${paymentRate}%` }}
              />
            </div>
            <span className="text-xs text-muted-foreground">{paymentRate}%</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">En attente</CardTitle>
          <Clock className="h-4 w-4 text-blue-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-600">
            {formatCurrency(stats.pendingAmount)}
          </div>
          <p className="text-xs text-muted-foreground">
            {stats.pendingCount} facture{stats.pendingCount > 1 ? "s" : ""} en
            attente
          </p>
        </CardContent>
      </Card>

      <Card className={stats.overdueCount > 0 ? "border-red-200" : ""}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">En retard</CardTitle>
          <AlertTriangle
            className={`h-4 w-4 ${
              stats.overdueCount > 0 ? "text-red-600" : "text-muted-foreground"
            }`}
          />
        </CardHeader>
        <CardContent>
          <div
            className={`text-2xl font-bold ${
              stats.overdueCount > 0 ? "text-red-600" : ""
            }`}
          >
            {formatCurrency(stats.overdueAmount)}
          </div>
          <p className="text-xs text-muted-foreground">
            {stats.overdueCount} facture{stats.overdueCount > 1 ? "s" : ""} en
            retard
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
