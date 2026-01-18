import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { templates, accounts } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { z } from "zod";
import {
  getFigmaNodes,
  getFigmaImage,
  parseFigmaDesign,
  extractTextElements,
  suggestVariableMappings,
} from "@/lib/figma";

const importSchema = z.object({
  figmaUrl: z.string().url(),
  fileKey: z.string().min(1),
  nodeId: z.string().optional(),
  name: z.string().min(1),
});

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { figmaUrl, fileKey, nodeId, name } = importSchema.parse(body);

    // Get Figma access token from user's account
    const figmaAccount = await db.query.accounts.findFirst({
      where: and(
        eq(accounts.userId, session.user.id),
        eq(accounts.provider, "figma")
      ),
    });

    if (!figmaAccount?.access_token) {
      return NextResponse.json(
        { error: "Figma account not connected. Please reconnect." },
        { status: 401 }
      );
    }

    const accessToken = figmaAccount.access_token;

    // Get the design from Figma
    const targetNodeId = nodeId || "0:0"; // Root if no specific node

    try {
      const nodesResponse = await getFigmaNodes(
        fileKey,
        [targetNodeId],
        accessToken
      );

      const nodeData = nodesResponse.nodes[targetNodeId];
      if (!nodeData?.document) {
        return NextResponse.json(
          { error: "Node not found in Figma file" },
          { status: 404 }
        );
      }

      // Parse the design
      const structure = parseFigmaDesign(nodeData.document, name);

      // Get thumbnail
      let thumbnailUrl = null;
      try {
        thumbnailUrl = await getFigmaImage(
          fileKey,
          targetNodeId,
          accessToken,
          "png",
          0.5
        );
      } catch {
        // Thumbnail is optional
        console.log("Failed to get thumbnail");
      }

      // Extract text elements and suggest mappings
      const textElements = extractTextElements(structure);
      const suggestedMappings = suggestVariableMappings(textElements);

      // Convert Map to object for storage
      const mappingsObject = Object.fromEntries(suggestedMappings);

      // Save template to database
      const [template] = await db
        .insert(templates)
        .values({
          userId: session.user.id,
          name,
          figmaFileKey: fileKey,
          figmaNodeId: nodeId,
          figmaUrl,
          structure: structure as unknown as Record<string, unknown>,
          mappings: mappingsObject,
          width: structure.width,
          height: structure.height,
          thumbnailUrl,
        })
        .returning({ id: templates.id });

      return NextResponse.json({
        success: true,
        templateId: template.id,
        elementsCount: structure.elements.length,
        textElementsCount: textElements.length,
        suggestedMappingsCount: suggestedMappings.size,
      });
    } catch (figmaError) {
      console.error("Figma API error:", figmaError);

      // Check if it's an auth error
      if (
        figmaError instanceof Error &&
        figmaError.message.includes("401")
      ) {
        return NextResponse.json(
          { error: "Figma access expired. Please reconnect your account." },
          { status: 401 }
        );
      }

      return NextResponse.json(
        {
          error:
            figmaError instanceof Error
              ? figmaError.message
              : "Failed to fetch from Figma",
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error importing template:", error);

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
