"use client";

import { Button } from "@/components/ui/button";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";

interface PreviewToggleProps {
  isPreviewMode: boolean;
  onToggle: () => void;
}

export function PreviewToggle({ isPreviewMode, onToggle }: PreviewToggleProps) {
  return (
    <Button
      variant={isPreviewMode ? "default" : "outline"}
      size="sm"
      onClick={onToggle}
      className={cn(
        "gap-2",
        isPreviewMode && "bg-green-600 hover:bg-green-700"
      )}
    >
      {isPreviewMode ? (
        <>
          <EyeOff className="h-4 w-4" />
          Masquer preview
        </>
      ) : (
        <>
          <Eye className="h-4 w-4" />
          Preview données
        </>
      )}
    </Button>
  );
}
