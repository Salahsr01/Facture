"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Bell, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { signOut } from "next-auth/react";
import type { User } from "next-auth";

interface HeaderProps {
  user: User;
}

const pageTitles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/invoices": "Factures",
  "/invoices/new": "Nouvelle facture",
  "/clients": "Clients",
  "/clients/new": "Nouveau client",
  "/templates": "Templates",
  "/templates/new": "Nouveau template",
  "/settings": "Paramètres",
  "/settings/profile": "Profil",
  "/settings/billing": "Facturation",
};

export function Header({ user }: HeaderProps) {
  const pathname = usePathname();

  // Get page title from pathname
  const getPageTitle = () => {
    // Check exact match first
    if (pageTitles[pathname]) return pageTitles[pathname];

    // Check for dynamic routes
    if (pathname.startsWith("/invoices/") && pathname !== "/invoices/new") {
      return "Détail facture";
    }
    if (pathname.startsWith("/clients/") && pathname !== "/clients/new") {
      return "Détail client";
    }
    if (pathname.startsWith("/templates/") && pathname !== "/templates/new") {
      return "Détail template";
    }

    return "FigmaInvoice";
  };

  return (
    <header className="flex h-16 items-center gap-4 border-b bg-card px-6">
      {/* Mobile menu button */}
      <Button variant="ghost" size="icon" className="md:hidden">
        <Menu className="h-5 w-5" />
        <span className="sr-only">Toggle menu</span>
      </Button>

      {/* Page title */}
      <h1 className="text-lg font-semibold">{getPageTitle()}</h1>

      {/* Right side */}
      <div className="ml-auto flex items-center gap-2">
        {/* Notifications */}
        <Button variant="ghost" size="icon">
          <Bell className="h-5 w-5" />
          <span className="sr-only">Notifications</span>
        </Button>

        {/* User menu */}
        <div className="flex items-center gap-2">
          <Link href="/settings/profile">
            {user.image ? (
              <img
                src={user.image}
                alt={user.name || "Avatar"}
                className="h-8 w-8 rounded-full hover:ring-2 ring-primary transition-all"
              />
            ) : (
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center hover:ring-2 ring-primary transition-all">
                <span className="text-sm font-medium">
                  {user.name?.charAt(0) || "U"}
                </span>
              </div>
            )}
          </Link>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => signOut({ callbackUrl: "/login" })}
            title="Déconnexion"
          >
            <LogOut className="h-5 w-5" />
            <span className="sr-only">Déconnexion</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
