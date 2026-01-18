"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Building2, CreditCard, AlertCircle } from "lucide-react";
import { isValidSiret, isValidSiren, isValidIban, formatIban } from "@/lib/utils";

interface CompanyFormProps {
  initialData: {
    companyName: string;
    address: string;
    city: string;
    postalCode: string;
    country: string;
    siret: string;
    siren: string;
    vatNumber: string;
    iban: string;
    bic: string;
    bankName: string;
    bankAddress: string;
  };
}

export function CompanyForm({ initialData }: CompanyFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState(initialData);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (formData.siret && !isValidSiret(formData.siret)) {
      newErrors.siret = "Le SIRET doit contenir 14 chiffres valides";
    }

    if (formData.siren && !isValidSiren(formData.siren)) {
      newErrors.siren = "Le SIREN doit contenir 9 chiffres valides";
    }

    if (formData.iban && !isValidIban(formData.iban)) {
      newErrors.iban = "Format IBAN invalide";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const response = await fetch("/api/user/company", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error("Failed to update company info");

      router.refresh();
    } catch (error) {
      console.error("Error updating company info:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Company Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            Identité de l&apos;entreprise
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Company Name */}
          <div className="space-y-2">
            <Label htmlFor="companyName">Nom de l&apos;entreprise</Label>
            <Input
              id="companyName"
              value={formData.companyName}
              onChange={(e) =>
                setFormData({ ...formData, companyName: e.target.value })
              }
              placeholder="Ma Super Entreprise"
            />
          </div>

          {/* Address */}
          <div className="space-y-2">
            <Label htmlFor="address">Adresse</Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) =>
                setFormData({ ...formData, address: e.target.value })
              }
              placeholder="123 rue de la Paix"
            />
          </div>

          {/* City & Postal Code */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="postalCode">Code postal</Label>
              <Input
                id="postalCode"
                value={formData.postalCode}
                onChange={(e) =>
                  setFormData({ ...formData, postalCode: e.target.value })
                }
                placeholder="75001"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="city">Ville</Label>
              <Input
                id="city"
                value={formData.city}
                onChange={(e) =>
                  setFormData({ ...formData, city: e.target.value })
                }
                placeholder="Paris"
              />
            </div>
          </div>

          {/* Country */}
          <div className="space-y-2">
            <Label htmlFor="country">Pays</Label>
            <Input
              id="country"
              value={formData.country}
              onChange={(e) =>
                setFormData({ ...formData, country: e.target.value })
              }
              placeholder="France"
            />
          </div>
        </CardContent>
      </Card>

      {/* Legal Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Informations légales</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* SIRET */}
          <div className="space-y-2">
            <Label htmlFor="siret">SIRET (14 chiffres)</Label>
            <Input
              id="siret"
              value={formData.siret}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, "").slice(0, 14);
                setFormData({ ...formData, siret: value });
                if (errors.siret) setErrors({ ...errors, siret: "" });
              }}
              placeholder="12345678901234"
              className={errors.siret ? "border-red-500" : ""}
            />
            {errors.siret && (
              <p className="text-xs text-red-500 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.siret}
              </p>
            )}
          </div>

          {/* SIREN */}
          <div className="space-y-2">
            <Label htmlFor="siren">SIREN (9 chiffres)</Label>
            <Input
              id="siren"
              value={formData.siren}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, "").slice(0, 9);
                setFormData({ ...formData, siren: value });
                if (errors.siren) setErrors({ ...errors, siren: "" });
              }}
              placeholder="123456789"
              className={errors.siren ? "border-red-500" : ""}
            />
            {errors.siren && (
              <p className="text-xs text-red-500 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.siren}
              </p>
            )}
          </div>

          {/* VAT Number */}
          <div className="space-y-2">
            <Label htmlFor="vatNumber">Numéro de TVA intracommunautaire</Label>
            <Input
              id="vatNumber"
              value={formData.vatNumber}
              onChange={(e) =>
                setFormData({ ...formData, vatNumber: e.target.value.toUpperCase() })
              }
              placeholder="FR12345678901"
            />
          </div>
        </CardContent>
      </Card>

      {/* Banking Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            Coordonnées bancaires
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* IBAN */}
          <div className="space-y-2">
            <Label htmlFor="iban">IBAN</Label>
            <Input
              id="iban"
              value={formData.iban}
              onChange={(e) => {
                const value = e.target.value.replace(/\s/g, "").toUpperCase();
                setFormData({ ...formData, iban: value });
                if (errors.iban) setErrors({ ...errors, iban: "" });
              }}
              placeholder="FR76 1234 5678 9012 3456 7890 123"
              className={errors.iban ? "border-red-500" : ""}
            />
            {errors.iban && (
              <p className="text-xs text-red-500 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.iban}
              </p>
            )}
            {formData.iban && !errors.iban && (
              <p className="text-xs text-muted-foreground">
                Format: {formatIban(formData.iban)}
              </p>
            )}
          </div>

          {/* BIC */}
          <div className="space-y-2">
            <Label htmlFor="bic">BIC / SWIFT</Label>
            <Input
              id="bic"
              value={formData.bic}
              onChange={(e) =>
                setFormData({ ...formData, bic: e.target.value.toUpperCase() })
              }
              placeholder="BNPAFRPP"
            />
          </div>

          {/* Bank Name */}
          <div className="space-y-2">
            <Label htmlFor="bankName">Nom de la banque</Label>
            <Input
              id="bankName"
              value={formData.bankName}
              onChange={(e) =>
                setFormData({ ...formData, bankName: e.target.value })
              }
              placeholder="BNP Paribas"
            />
          </div>

          {/* Bank Address */}
          <div className="space-y-2">
            <Label htmlFor="bankAddress">Adresse de la banque</Label>
            <Input
              id="bankAddress"
              value={formData.bankAddress}
              onChange={(e) =>
                setFormData({ ...formData, bankAddress: e.target.value })
              }
              placeholder="16 Boulevard des Italiens, 75009 Paris"
            />
          </div>
        </CardContent>
      </Card>

      {/* Submit */}
      <div className="flex justify-end">
        <Button type="submit" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Enregistrer les modifications
        </Button>
      </div>
    </form>
  );
}
