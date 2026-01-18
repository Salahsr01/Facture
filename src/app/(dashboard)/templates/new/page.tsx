"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

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

export default function ImportFigmaPage() {
  const router = useRouter();
  const [figmaUrl, setFigmaUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!figmaUrl.trim()) {
      setError("Veuillez coller un lien Figma");
      return;
    }

    const parsed = parseFigmaUrl(figmaUrl);
    if (!parsed) {
      setError("Veuillez entrer un lien Figma valide");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/templates/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          figmaUrl,
          fileKey: parsed.fileKey,
          nodeId: parsed.nodeId,
          name: `Template ${new Date().toLocaleDateString("fr-FR")}`,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erreur lors de l'import");
      }

      // Redirect to the template preview page
      router.push(`/templates/${data.templateId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de l'import");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative w-[595px] h-[842px] border border-[#404040]">
      {/* Center content */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-[20px]">
        {/* White card with input */}
        <div className="bg-white rounded-[3px] px-[17px] py-[6px] w-[190px] h-[40px] flex items-center justify-center overflow-hidden">
          <div className="flex flex-col gap-[5px] items-center justify-center w-[152px]">
            {/* Title with Figma icon */}
            <div className="flex items-center gap-[10px]">
              <p className="text-[#080808] text-[8px] font-medium" style={{ fontFamily: "'Helvetica Neue', sans-serif" }}>
                Importé votre facture depuis
              </p>
              <svg width="7" height="10" viewBox="0 0 7 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M1.68359 10C2.61328 10 3.36719 9.24609 3.36719 8.31641V6.63281H1.68359C0.753906 6.63281 0 7.38672 0 8.31641C0 9.24609 0.753906 10 1.68359 10Z" fill="#0ACF83"/>
                <path d="M0 5C0 4.07031 0.753906 3.31641 1.68359 3.31641H3.36719V6.68359H1.68359C0.753906 6.68359 0 5.92969 0 5Z" fill="#A259FF"/>
                <path d="M0 1.68359C0 0.753906 0.753906 0 1.68359 0H3.36719V3.36719H1.68359C0.753906 3.36719 0 2.61328 0 1.68359Z" fill="#F24E1E"/>
                <path d="M3.36719 0H5.05078C5.98047 0 6.73438 0.753906 6.73438 1.68359C6.73438 2.61328 5.98047 3.36719 5.05078 3.36719H3.36719V0Z" fill="#FF7262"/>
                <path d="M6.73438 5C6.73438 5.92969 5.98047 6.68359 5.05078 6.68359C4.12109 6.68359 3.36719 5.92969 3.36719 5C3.36719 4.07031 4.12109 3.31641 5.05078 3.31641C5.98047 3.31641 6.73438 4.07031 6.73438 5Z" fill="#1ABCFE"/>
              </svg>
            </div>

            {/* Input field */}
            <input
              type="text"
              value={figmaUrl}
              onChange={(e) => {
                setFigmaUrl(e.target.value);
                setError("");
              }}
              placeholder="Collé votre liens ici"
              className="w-full border-[0.4px] border-[#080808] rounded-[2px] px-[2px] py-[3px] text-[6px] font-light focus:outline-none focus:border-[#ea3326]"
              style={{
                fontFamily: "'Helvetica Neue', sans-serif",
                color: figmaUrl ? "#080808" : "rgba(8,8,8,0.5)",
                boxShadow: "0px 4px 4px 0px rgba(0,0,0,0.25)"
              }}
            />
          </div>
        </div>

        {/* Red submit button */}
        <button
          onClick={handleSubmit}
          disabled={isLoading}
          className="bg-[#ea3326] border-[0.4px] border-[#bbb] rounded-[3px] px-[17px] py-[6px] flex items-center gap-[10px] overflow-hidden hover:bg-[#d62d21] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <p className="text-white text-[8px] font-medium" style={{ fontFamily: "'Helvetica Neue', sans-serif" }}>
            {isLoading ? "Chargement..." : "Reproduire votre facture avec Mistral"}
          </p>
          {!isLoading && (
            <svg width="9" height="8" viewBox="0 0 9 8" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M8.53125 3.58984H2.33984L5.09766 0.832031L4.26562 0L0 4L4.26562 8L5.09766 7.16797L2.33984 4.41016H8.53125V3.58984Z" fill="white" transform="scale(-1, 1) translate(-8.53125, 0)"/>
            </svg>
          )}
        </button>

        {/* Error message */}
        {error && (
          <p className="text-[#ea3326] text-[10px] font-medium text-center max-w-[200px]" style={{ fontFamily: "'Helvetica Neue', sans-serif" }}>
            {error}
          </p>
        )}
      </div>
    </div>
  );
}
