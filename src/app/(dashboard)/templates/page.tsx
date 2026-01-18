import Link from "next/link";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { templates } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, LayoutTemplate, ExternalLink } from "lucide-react";
import { formatDate } from "@/lib/utils";

async function getTemplates(userId: string) {
  try {
    return await db.query.templates.findMany({
      where: eq(templates.userId, userId),
      orderBy: (templates, { desc }) => [desc(templates.createdAt)],
    });
  } catch {
    return [];
  }
}

export default async function TemplatesPage() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const userTemplates = await getTemplates(session.user.id);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Templates</h2>
          <p className="text-muted-foreground">
            Gérez vos designs de facture importés depuis Figma
          </p>
        </div>
        <Button asChild>
          <Link href="/templates/new">
            <Plus className="mr-2 h-4 w-4" />
            Importer depuis Figma
          </Link>
        </Button>
      </div>

      {/* Templates Grid */}
      {userTemplates.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <LayoutTemplate className="h-12 w-12 text-muted-foreground/50" />
            <h3 className="mt-4 text-lg font-semibold">Aucun template</h3>
            <p className="mt-2 text-center text-muted-foreground max-w-sm">
              Importez votre premier design de facture depuis Figma pour
              commencer à créer des factures personnalisées.
            </p>
            <Button asChild className="mt-6">
              <Link href="/templates/new">
                <Plus className="mr-2 h-4 w-4" />
                Importer depuis Figma
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {userTemplates.map((template) => (
            <Card key={template.id} className="group hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-base">{template.name}</CardTitle>
                    <CardDescription>
                      {template.description || "Aucune description"}
                    </CardDescription>
                  </div>
                  {template.figmaUrl && (
                    <a
                      href={template.figmaUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {/* Thumbnail */}
                <div className="aspect-[3/4] bg-muted rounded-lg mb-4 overflow-hidden">
                  {template.thumbnailUrl ? (
                    <img
                      src={template.thumbnailUrl}
                      alt={template.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <LayoutTemplate className="h-8 w-8 text-muted-foreground/30" />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>
                    {template.width}×{template.height}px
                  </span>
                  <span>{formatDate(template.createdAt)}</span>
                </div>

                {/* Actions */}
                <div className="flex gap-2 mt-4">
                  <Button asChild variant="outline" size="sm" className="flex-1">
                    <Link href={`/templates/${template.id}`}>
                      Modifier
                    </Link>
                  </Button>
                  <Button asChild size="sm" className="flex-1">
                    <Link href={`/invoices/new?template=${template.id}`}>
                      Utiliser
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
