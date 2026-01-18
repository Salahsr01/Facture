"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2, ArrowLeft, AlertCircle, CheckCircle } from "lucide-react";

// Figma URL patterns
const FIGMA_URL_REGEX =
  /https:\/\/(www\.)?figma\.com\/(file|design)\/([a-zA-Z0-9]+)(\/.*)?(\?node-id=([0-9-]+))?/;

function parseFigmaUrl(url: string): { fileKey: string; nodeId?: string } | null {
  const match = url.match(FIGMA_URL_REGEX);
  if (!match) return null;

  const fileKey = match[3];
  const nodeIdMatch = url.match(/node-id=([0-9:-]+)/);
  const nodeId = nodeIdMatch ? nodeIdMatch[1].replace("-", ":") : undefined;

  return { fileKey, nodeId };
}

export default function NewTemplatePage() {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState<"input" | "preview" | "confirm">("input");
  const [parsedUrl, setParsedUrl] = useState<{
    fileKey: string;
    nodeId?: string;
  } | null>(null);

  const handleUrlChange = (value: string) => {
    setUrl(value);
    setError("");

    if (value.trim()) {
      const parsed = parseFigmaUrl(value);
      if (!parsed) {
        setError("URL Figma invalide. Copiez l'URL depuis Figma.");
      } else {
        setParsedUrl(parsed);
      }
    } else {
      setParsedUrl(null);
    }
  };

  const handleImport = async () => {
    if (!parsedUrl) return;

    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/templates/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          figmaUrl: url,
          fileKey: parsedUrl.fileKey,
          nodeId: parsedUrl.nodeId,
          name: name || `Template ${new Date().toLocaleDateString("fr-FR")}`,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Échec de l'import");
      }

      // Redirect to template editor
      router.push(`/templates/${data.templateId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de l'import");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <Button variant="ghost" size="sm" asChild className="mb-4">
          <Link href="/templates">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour aux templates
          </Link>
        </Button>
        <h2 className="text-2xl font-bold">Importer depuis Figma</h2>
        <p className="text-muted-foreground">
          Importez un design de facture depuis votre fichier Figma
        </p>
      </div>

      {/* Import Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">URL du design Figma</CardTitle>
          <CardDescription>
            Copiez l&apos;URL de votre design de facture depuis Figma. Vous
            pouvez copier l&apos;URL d&apos;un fichier entier ou d&apos;un frame
            spécifique.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* URL Input */}
          <div className="space-y-2">
            <Label htmlFor="url">URL Figma</Label>
            <Input
              id="url"
              type="url"
              value={url}
              onChange={(e) => handleUrlChange(e.target.value)}
              placeholder="https://www.figma.com/design/xxx/..."
              className={error ? "border-red-500" : ""}
            />
            {error && (
              <p className="text-xs text-red-500 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {error}
              </p>
            )}
            {parsedUrl && !error && (
              <p className="text-xs text-green-600 flex items-center gap-1">
                <CheckCircle className="h-3 w-3" />
                URL valide - Fichier: {parsedUrl.fileKey}
                {parsedUrl.nodeId && ` (Node: ${parsedUrl.nodeId})`}
              </p>
            )}
          </div>

          {/* Name Input */}
          <div className="space-y-2">
            <Label htmlFor="name">Nom du template (optionnel)</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ma facture personnalisée"
            />
          </div>

          {/* Tips */}
          <div className="bg-muted/50 p-4 rounded-lg">
            <h4 className="font-medium text-sm mb-2">
              Comment obtenir l&apos;URL ?
            </h4>
            <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
              <li>Ouvrez votre fichier Figma</li>
              <li>Sélectionnez le frame de votre facture</li>
              <li>Clic droit → &quot;Copy link to selection&quot;</li>
              <li>Collez l&apos;URL ci-dessus</li>
            </ol>
          </div>

          {/* Submit */}
          <Button
            onClick={handleImport}
            disabled={!parsedUrl || isLoading}
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Import en cours...
              </>
            ) : (
              "Importer le design"
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-lg">Ce que nous importons</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              Structure du design (frames, groupes, textes)
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              Styles (couleurs, polices, tailles)
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              Positions et dimensions
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              Textes pour le mapping des variables
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
