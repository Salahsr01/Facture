import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { ProfileForm } from "@/components/forms/profile-form";

async function getUserProfile(userId: string) {
  try {
    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
    });
    return user;
  } catch {
    return null;
  }
}

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const user = await getUserProfile(session.user.id);

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h2 className="text-lg font-semibold">Informations personnelles</h2>
        <p className="text-sm text-muted-foreground">
          Ces informations seront utilisées pour votre profil et vos factures.
        </p>
      </div>

      <ProfileForm
        initialData={{
          name: user?.name || "",
          email: user?.email || "",
          phone: user?.phone || "",
          image: user?.image || "",
        }}
      />
    </div>
  );
}
