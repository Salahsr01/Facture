import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { templates } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { TemplateEditor } from "@/components/editor/template-editor";
import type { FigmaDesignStructure } from "@/types";

interface TemplatePageProps {
  params: Promise<{ id: string }>;
}

async function getTemplate(userId: string, templateId: string) {
  try {
    return await db.query.templates.findFirst({
      where: and(eq(templates.id, templateId), eq(templates.userId, userId)),
    });
  } catch {
    return null;
  }
}

export default async function TemplatePage({ params }: TemplatePageProps) {
  const { id } = await params;
  const session = await auth();

  if (!session?.user?.id) return null;

  const template = await getTemplate(session.user.id, id);

  if (!template) {
    notFound();
  }

  return (
    <div className="h-[calc(100vh-8rem)]">
      <TemplateEditor
        template={{
          id: template.id,
          name: template.name,
          structure: template.structure as FigmaDesignStructure | null,
          mappings: template.mappings as Record<string, string> | null,
          styleOverrides: template.styleOverrides as Record<string, unknown> | null,
          width: template.width || 800,
          height: template.height || 1200,
          figmaUrl: template.figmaUrl,
        }}
      />
    </div>
  );
}
