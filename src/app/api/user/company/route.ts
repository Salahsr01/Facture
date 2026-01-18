import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";

const companySchema = z.object({
  companyName: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  postalCode: z.string().optional(),
  country: z.string().optional(),
  siret: z.string().max(14).optional(),
  siren: z.string().max(9).optional(),
  vatNumber: z.string().optional(),
  iban: z.string().optional(),
  bic: z.string().max(11).optional(),
  bankName: z.string().optional(),
  bankAddress: z.string().optional(),
});

export async function PATCH(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = companySchema.parse(body);

    // Clean up empty strings to null
    const cleanedData = Object.fromEntries(
      Object.entries(validatedData).map(([key, value]) => [
        key,
        value === "" ? null : value,
      ])
    );

    await db
      .update(users)
      .set({
        ...cleanedData,
        updatedAt: new Date(),
      })
      .where(eq(users.id, session.user.id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating company info:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid data", details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await db.query.users.findFirst({
      where: eq(users.id, session.user.id),
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      companyName: user.companyName,
      address: user.address,
      city: user.city,
      postalCode: user.postalCode,
      country: user.country,
      siret: user.siret,
      siren: user.siren,
      vatNumber: user.vatNumber,
      // Don't expose full IBAN for security
      ibanLast4: user.iban ? `****${user.iban.slice(-4)}` : null,
      bic: user.bic,
      bankName: user.bankName,
      bankAddress: user.bankAddress,
    });
  } catch (error) {
    console.error("Error fetching company info:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
