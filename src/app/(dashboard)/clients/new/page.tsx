import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ClientForm } from "@/components/forms/client-form";

export default async function NewClientPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  return (
    <div className="container max-w-4xl py-6">
      <ClientForm mode="create" />
    </div>
  );
}
