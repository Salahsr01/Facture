"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, CreditCard } from "lucide-react";
import { toast } from "sonner";

interface PaymentButtonProps {
  invoiceId: string;
  token: string;
  amount: number;
}

export function PaymentButton({ invoiceId, token, amount }: PaymentButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handlePayment = async () => {
    setIsLoading(true);

    try {
      const response = await fetch("/api/payments/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          invoiceId,
          token,
          amount,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erreur lors de la création du paiement");
      }

      // Redirect to Stripe Checkout
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error("URL de paiement non reçue");
      }
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Erreur lors de la création du paiement"
      );
      setIsLoading(false);
    }
  };

  return (
    <Button
      size="lg"
      className="w-full"
      onClick={handlePayment}
      disabled={isLoading}
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Redirection vers le paiement...
        </>
      ) : (
        <>
          <CreditCard className="mr-2 h-4 w-4" />
          Payer maintenant
        </>
      )}
    </Button>
  );
}
