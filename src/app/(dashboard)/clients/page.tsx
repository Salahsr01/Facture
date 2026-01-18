import Link from "next/link";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { clients } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Users, Mail, Phone, Building2 } from "lucide-react";

async function getClients(userId: string) {
  try {
    return await db.query.clients.findMany({
      where: eq(clients.userId, userId),
      orderBy: [desc(clients.createdAt)],
    });
  } catch {
    return [];
  }
}

export default async function ClientsPage() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const userClients = await getClients(session.user.id);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Clients</h2>
          <p className="text-muted-foreground">
            Gérez votre base de clients
          </p>
        </div>
        <Button asChild>
          <Link href="/clients/new">
            <Plus className="mr-2 h-4 w-4" />
            Ajouter un client
          </Link>
        </Button>
      </div>

      {/* Clients Grid */}
      {userClients.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Users className="h-12 w-12 text-muted-foreground/50" />
            <h3 className="mt-4 text-lg font-semibold">Aucun client</h3>
            <p className="mt-2 text-center text-muted-foreground max-w-sm">
              Ajoutez votre premier client pour pouvoir créer des factures.
            </p>
            <Button asChild className="mt-6">
              <Link href="/clients/new">
                <Plus className="mr-2 h-4 w-4" />
                Ajouter un client
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {userClients.map((client) => (
            <Card key={client.id} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Building2 className="h-6 w-6 text-primary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold truncate">
                      {client.companyName}
                    </h3>
                    {client.contactName && (
                      <p className="text-sm text-muted-foreground truncate">
                        {client.contactName}
                        {client.contactTitle && ` - ${client.contactTitle}`}
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-4 space-y-2">
                  {client.email && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Mail className="h-4 w-4" />
                      <span className="truncate">{client.email}</span>
                    </div>
                  )}
                  {client.phone && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Phone className="h-4 w-4" />
                      <span>{client.phone}</span>
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-4 border-t flex gap-2">
                  <Button asChild variant="outline" size="sm" className="flex-1">
                    <Link href={`/clients/${client.id}`}>Voir</Link>
                  </Button>
                  <Button asChild size="sm" className="flex-1">
                    <Link href={`/invoices/new?client=${client.id}`}>
                      Facturer
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
