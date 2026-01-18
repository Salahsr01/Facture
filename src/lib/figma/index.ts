import type { FigmaNode, FigmaElement, FigmaDesignStructure } from "@/types";

const FIGMA_API_BASE = "https://api.figma.com/v1";

interface FigmaApiResponse {
  document: FigmaNode;
  components: Record<string, unknown>;
  styles: Record<string, unknown>;
  name: string;
  lastModified: string;
  thumbnailUrl: string;
}

interface FigmaNodesResponse {
  nodes: Record<string, { document: FigmaNode }>;
}

/**
 * Get file data from Figma API
 */
export async function getFigmaFile(
  fileKey: string,
  accessToken: string
): Promise<FigmaApiResponse> {
  const response = await fetch(`${FIGMA_API_BASE}/files/${fileKey}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || `Figma API error: ${response.status}`);
  }

  return response.json();
}

/**
 * Get specific nodes from Figma API
 */
export async function getFigmaNodes(
  fileKey: string,
  nodeIds: string[],
  accessToken: string
): Promise<FigmaNodesResponse> {
  const ids = nodeIds.join(",");
  const response = await fetch(
    `${FIGMA_API_BASE}/files/${fileKey}/nodes?ids=${encodeURIComponent(ids)}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || `Figma API error: ${response.status}`);
  }

  return response.json();
}

/**
 * Get image for a node
 */
export async function getFigmaImage(
  fileKey: string,
  nodeId: string,
  accessToken: string,
  format: "png" | "svg" | "jpg" = "png",
  scale: number = 1
): Promise<string> {
  const response = await fetch(
    `${FIGMA_API_BASE}/images/${fileKey}?ids=${encodeURIComponent(
      nodeId
    )}&format=${format}&scale=${scale}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to get image: ${response.status}`);
  }

  const data = await response.json();
  return data.images[nodeId] || null;
}

/**
 * Convert Figma color to hex
 */
function figmaColorToHex(color: {
  r: number;
  g: number;
  b: number;
  a?: number;
}): string {
  const r = Math.round(color.r * 255);
  const g = Math.round(color.g * 255);
  const b = Math.round(color.b * 255);
  return `#${r.toString(16).padStart(2, "0")}${g
    .toString(16)
    .padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
}

/**
 * Parse a Figma node tree into our structure
 */
export function parseFigmaNode(
  node: FigmaNode,
  parentX: number = 0,
  parentY: number = 0
): FigmaElement[] {
  const elements: FigmaElement[] = [];

  const x = (node.absoluteBoundingBox?.x || 0) - parentX;
  const y = (node.absoluteBoundingBox?.y || 0) - parentY;
  const width = node.absoluteBoundingBox?.width || 0;
  const height = node.absoluteBoundingBox?.height || 0;

  // Map Figma types to our types
  const typeMap: Record<string, FigmaElement["type"]> = {
    TEXT: "TEXT",
    FRAME: "FRAME",
    RECTANGLE: "RECTANGLE",
    ELLIPSE: "ELLIPSE",
    GROUP: "GROUP",
    VECTOR: "VECTOR",
    INSTANCE: "FRAME",
    COMPONENT: "FRAME",
  };

  const elementType = typeMap[node.type] || "FRAME";

  // Extract style information
  const style: FigmaElement["style"] = {};

  if (node.style) {
    style.fontFamily = node.style.fontFamily;
    style.fontSize = node.style.fontSize;
    style.fontWeight = node.style.fontWeight;
  }

  // Get fill color
  if (node.fills && Array.isArray(node.fills) && node.fills.length > 0) {
    const fill = node.fills[0];
    if (fill.type === "SOLID" && fill.color) {
      if (node.type === "TEXT") {
        style.color = figmaColorToHex(fill.color);
      } else {
        style.backgroundColor = figmaColorToHex(fill.color);
      }
    }
    style.opacity = fill.opacity;
  }

  // Create element
  const element: FigmaElement = {
    id: crypto.randomUUID(),
    nodeId: node.id,
    name: node.name,
    type: elementType,
    x,
    y,
    width,
    height,
    content: node.characters,
    style,
  };

  elements.push(element);

  // Process children
  if (node.children) {
    const rootX = node.absoluteBoundingBox?.x || 0;
    const rootY = node.absoluteBoundingBox?.y || 0;

    for (const child of node.children) {
      elements.push(...parseFigmaNode(child, rootX, rootY));
    }
  }

  return elements;
}

/**
 * Parse Figma design into our structure
 */
export function parseFigmaDesign(
  node: FigmaNode,
  fileName: string
): FigmaDesignStructure {
  const elements = parseFigmaNode(node);

  // Get root dimensions
  const width = node.absoluteBoundingBox?.width || 800;
  const height = node.absoluteBoundingBox?.height || 1200;

  return {
    id: node.id,
    name: fileName,
    width,
    height,
    elements,
    lastSynced: new Date().toISOString(),
  };
}

/**
 * Extract text elements for variable mapping
 */
export function extractTextElements(
  structure: FigmaDesignStructure
): FigmaElement[] {
  return structure.elements.filter((el) => el.type === "TEXT");
}

/**
 * Suggest variable mappings based on text content
 */
export function suggestVariableMappings(
  textElements: FigmaElement[]
): Map<string, string> {
  const suggestions = new Map<string, string>();

  const patterns: Array<{ regex: RegExp; variable: string }> = [
    // Invoice
    { regex: /facture|invoice|n°|#/i, variable: "invoice.number" },
    { regex: /date.*facture|invoice.*date/i, variable: "invoice.date" },
    { regex: /échéance|due.*date|payment.*date/i, variable: "invoice.dueDate" },

    // Sender
    { regex: /émetteur|from|expéditeur/i, variable: "sender.name" },
    { regex: /siret.*émetteur|your.*siret/i, variable: "sender.siret" },
    { regex: /siren.*émetteur|your.*siren/i, variable: "sender.siren" },

    // Recipient
    { regex: /destinataire|to|client|customer/i, variable: "recipient.companyName" },
    { regex: /contact/i, variable: "recipient.contactName" },

    // Amounts
    { regex: /sous-total|subtotal/i, variable: "totals.subtotal" },
    { regex: /tva|vat|tax/i, variable: "totals.taxAmount" },
    { regex: /total\s*(ttc)?$/i, variable: "totals.total" },

    // Bank
    { regex: /iban/i, variable: "bank.iban" },
    { regex: /bic|swift/i, variable: "bank.bic" },
    { regex: /banque|bank/i, variable: "bank.name" },

    // Terms
    { regex: /conditions|terms|paiement/i, variable: "terms" },
  ];

  for (const element of textElements) {
    const name = element.name.toLowerCase();
    const content = (element.content || "").toLowerCase();

    for (const { regex, variable } of patterns) {
      if (regex.test(name) || regex.test(content)) {
        suggestions.set(element.id, variable);
        break;
      }
    }
  }

  return suggestions;
}
