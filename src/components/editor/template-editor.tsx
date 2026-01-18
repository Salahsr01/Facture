"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ArrowLeft,
  Save,
  Loader2,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  ExternalLink,
  Type,
  Link as LinkIcon,
} from "lucide-react";
import { EditorCanvas } from "./editor-canvas";
import { VariableMappingPanel } from "./variable-mapping-panel";
import { PreviewToggle } from "./preview-toggle";
import { SAMPLE_INVOICE_DATA } from "@/lib/invoice-data";
import type { FigmaDesignStructure, FigmaElement, VariableName, InvoiceData } from "@/types";

interface TemplateEditorProps {
  template: {
    id: string;
    name: string;
    structure: FigmaDesignStructure | null;
    mappings: Record<string, string> | null;
    styleOverrides: Record<string, unknown> | null;
    width: number;
    height: number;
    figmaUrl: string | null;
  };
}

export function TemplateEditor({ template }: TemplateEditorProps) {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [zoom, setZoom] = useState(0.8);
  const [selectedElement, setSelectedElement] = useState<FigmaElement | null>(
    null
  );
  const [mappings, setMappings] = useState<Record<string, string>>(
    template.mappings || {}
  );
  const [name, setName] = useState(template.name);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [previewData] = useState<InvoiceData>(SAMPLE_INVOICE_DATA);

  const structure = template.structure;

  const handleTogglePreview = useCallback(() => {
    setIsPreviewMode((prev) => !prev);
  }, []);

  const handleZoomIn = () => setZoom((z) => Math.min(z + 0.1, 2));
  const handleZoomOut = () => setZoom((z) => Math.max(z - 0.1, 0.3));
  const handleResetZoom = () => setZoom(0.8);

  const handleElementSelect = useCallback((element: FigmaElement | null) => {
    setSelectedElement(element);
  }, []);

  const handleMappingChange = useCallback(
    (elementId: string, variable: VariableName | null) => {
      setMappings((prev) => {
        const next = { ...prev };
        if (variable) {
          next[elementId] = variable;
        } else {
          delete next[elementId];
        }
        return next;
      });
    },
    []
  );

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await fetch(`/api/templates/${template.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          mappings,
        }),
      });

      if (!response.ok) throw new Error("Failed to save");

      router.refresh();
    } catch (error) {
      console.error("Error saving template:", error);
    } finally {
      setIsSaving(false);
    }
  };

  // Count mapped elements
  const mappedCount = Object.keys(mappings).length;
  const textElements =
    structure?.elements.filter((el) => el.type === "TEXT") || [];
  const totalTextElements = textElements.length;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between border-b px-4 py-3 bg-card">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/templates">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour
            </Link>
          </Button>
          <div className="h-6 w-px bg-border" />
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="h-8 w-64 font-medium"
          />
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

        <div className="flex items-center gap-2">
          {/* Preview toggle */}
          <PreviewToggle
            isPreviewMode={isPreviewMode}
            onToggle={handleTogglePreview}
          />

          <div className="h-6 w-px bg-border" />

          {/* Zoom controls */}
          <div className="flex items-center gap-1 mr-4">
            <Button variant="ghost" size="icon" onClick={handleZoomOut}>
              <ZoomOut className="h-4 w-4" />
            </Button>
            <span className="text-sm w-12 text-center">
              {Math.round(zoom * 100)}%
            </span>
            <Button variant="ghost" size="icon" onClick={handleZoomIn}>
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={handleResetZoom}>
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>

          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Enregistrer
          </Button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Canvas */}
        <div className="flex-1 overflow-auto bg-muted/30 p-8">
          {structure ? (
            <EditorCanvas
              structure={structure}
              mappings={mappings}
              zoom={zoom}
              selectedElement={selectedElement}
              onElementSelect={handleElementSelect}
              isPreviewMode={isPreviewMode}
              previewData={previewData}
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center text-muted-foreground">
                <p>Aucune structure de design chargée.</p>
                <p className="text-sm mt-2">
                  Réimportez le template depuis Figma.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Right panel */}
        <div className="w-80 border-l bg-card overflow-auto">
          {/* Stats */}
          <div className="p-4 border-b">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-muted/50 rounded-lg">
                <div className="text-2xl font-bold">{totalTextElements}</div>
                <div className="text-xs text-muted-foreground">
                  Éléments texte
                </div>
              </div>
              <div className="text-center p-3 bg-muted/50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {mappedCount}
                </div>
                <div className="text-xs text-muted-foreground">Mappés</div>
              </div>
            </div>
          </div>

          {/* Selected element panel */}
          {selectedElement ? (
            <div className="p-4 space-y-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Type className="h-4 w-4" />
                    Élément sélectionné
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <Label className="text-xs text-muted-foreground">Nom</Label>
                    <p className="text-sm font-medium">{selectedElement.name}</p>
                  </div>
                  {selectedElement.content && (
                    <div>
                      <Label className="text-xs text-muted-foreground">
                        Contenu
                      </Label>
                      <p className="text-sm bg-muted/50 p-2 rounded">
                        {selectedElement.content}
                      </p>
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-muted-foreground">Position:</span>
                      <span className="ml-1">
                        {Math.round(selectedElement.x)},{" "}
                        {Math.round(selectedElement.y)}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Taille:</span>
                      <span className="ml-1">
                        {Math.round(selectedElement.width)}×
                        {Math.round(selectedElement.height)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Variable mapping for selected element */}
              {selectedElement.type === "TEXT" && (
                <VariableMappingPanel
                  element={selectedElement}
                  currentMapping={
                    mappings[selectedElement.id] as VariableName | undefined
                  }
                  onMappingChange={(variable) =>
                    handleMappingChange(selectedElement.id, variable)
                  }
                />
              )}
            </div>
          ) : (
            <div className="p-4">
              <div className="text-center text-muted-foreground py-8">
                <LinkIcon className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">
                  Sélectionnez un élément texte sur le canvas pour le mapper à
                  une variable.
                </p>
              </div>

              {/* Quick mappings list */}
              {mappedCount > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium mb-2">Mappings actuels</h4>
                  <div className="space-y-1">
                    {Object.entries(mappings).map(([elementId, variable]) => {
                      const element = structure?.elements.find(
                        (e) => e.id === elementId
                      );
                      return (
                        <div
                          key={elementId}
                          className="flex items-center justify-between text-xs p-2 bg-muted/50 rounded cursor-pointer hover:bg-muted"
                          onClick={() => element && setSelectedElement(element)}
                        >
                          <span className="truncate">{element?.name}</span>
                          <span className="text-muted-foreground">
                            {variable}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
