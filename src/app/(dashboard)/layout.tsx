import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { SidebarFigma } from "@/components/layout/sidebar-figma";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen bg-[#121211]">
      <SidebarFigma user={session.user} />
      <main className="flex-1 flex items-center justify-center p-6">
        {children}
      </main>
    </div>
  );
}
