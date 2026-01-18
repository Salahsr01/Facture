"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

interface SidebarFigmaProps {
  user: {
    name?: string | null;
    image?: string | null;
    email?: string | null;
  };
}

const navItems = [
  { label: "Dashbord", href: "/dashboard" },
  { label: "Rapport", href: "/rapport" },
  { label: "Facture", href: "/templates/new" },
];

export function SidebarFigma({ user }: SidebarFigmaProps) {
  const pathname = usePathname();

  return (
    <aside className="w-[200px] min-h-screen bg-[#121211] flex flex-col">
      {/* User Profile */}
      <div className="flex items-center gap-2 px-[15px] pt-[40px]">
        <div className="p-[10px]">
          <div className="w-[43px] h-[43px] rounded-full overflow-hidden bg-[#2a2a2a]">
            {user.image ? (
              <Image
                src={user.image}
                alt={user.name || "User"}
                width={43}
                height={43}
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white text-lg font-medium">
                {user.name?.charAt(0) || "U"}
              </div>
            )}
          </div>
        </div>
        <div className="flex flex-col gap-[6px]">
          <p className="text-white text-[16px] font-medium font-['Helvetica_Neue',sans-serif]">
            {user.name || "Utilisateur"}
          </p>
          <p className="text-white text-[8px] font-normal font-['Helvetica_Neue',sans-serif]">
            Chef de Projet
          </p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-[13px] px-[25px] pt-[50px]">
        {navItems.map((item) => {
          const isActive = pathname === item.href ||
            (item.href === "/templates/new" && pathname.startsWith("/templates"));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "text-[12px] font-medium font-['Helvetica_Neue',sans-serif] transition-colors",
                isActive
                  ? "text-white"
                  : "text-white/30 hover:text-white/60"
              )}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
