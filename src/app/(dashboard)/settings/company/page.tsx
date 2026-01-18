import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { CompanyForm } from "@/components/forms/company-form";

async function getUserCompanyInfo(userId: string) {
  try {
    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
    });
    return user;
  } catch {
    return null;
  }
}

export default async function CompanyPage() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const user = await getUserCompanyInfo(session.user.id);

  return (
    <div className="max-w-2xl space-y-8">
      {/* Company Info */}
      <div>
        <div className="mb-6">
          <h2 className="text-lg font-semibold">Informations entreprise</h2>
          <p className="text-sm text-muted-foreground">
            Ces informations apparaîtront sur vos factures.
          </p>
        </div>

        <CompanyForm
          initialData={{
            companyName: user?.companyName || "",
            address: user?.address || "",
            city: user?.city || "",
            postalCode: user?.postalCode || "",
            country: user?.country || "France",
            siret: user?.siret || "",
            siren: user?.siren || "",
            vatNumber: user?.vatNumber || "",
            iban: user?.iban || "",
            bic: user?.bic || "",
            bankName: user?.bankName || "",
            bankAddress: user?.bankAddress || "",
          }}
        />
      </div>
    </div>
  );
}
