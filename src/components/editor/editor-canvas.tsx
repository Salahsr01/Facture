"use client";

import { useRef, useMemo } from "react";
import { cn } from "@/lib/utils";
import { getInvoiceValue } from "@/lib/invoice-data";
import type { FigmaDesignStructure, FigmaElement, InvoiceData, VariableName } from "@/types";

interface EditorCanvasProps {
  structure: FigmaDesignStructure;
  mappings: Record<string, string>;
  zoom: number;
  selectedElement: FigmaElement | null;
  onElementSelect: (element: FigmaElement | null) => void;
  isPreviewMode?: boolean;
  previewData?: InvoiceData;
}

export function EditorCanvas({
  structure,
  mappings,
  zoom,
  selectedElement,
  onElementSelect,
  isPreviewMode = false,
  previewData,
}: EditorCanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null);

  // Filter to only show visible/relevant elements
  const renderableElements = useMemo(() => {
    return structure.elements.filter(
      (el) =>
        el.type === "TEXT" ||
        el.type === "RECTANGLE" ||
        el.type === "FRAME" ||
        el.type === "ELLIPSE"
    );
  }, [structure.elements]);

  const handleCanvasClick = (e: React.MouseEvent) => {
    // Deselect when clicking on canvas background
    if (e.target === canvasRef.current) {
      onElementSelect(null);
    }
  };

  return (
    <div
      className="flex items-center justify-center"
      onClick={handleCanvasClick}
    >
      <div
        ref={canvasRef}
        className="relative bg-white shadow-xl rounded-lg overflow-hidden"
        style={{
          width: structure.width * zoom,
          height: structure.height * zoom,
          transform: `scale(1)`,
          transformOrigin: "top left",
        }}
      >
        {/* Render elements */}
        {renderableElements.map((element) => (
          <CanvasElement
            key={element.id}
            element={element}
            zoom={zoom}
            isSelected={selectedElement?.id === element.id}
            isMapped={!!mappings[element.id]}
            mappedVariable={mappings[element.id]}
            onClick={() => onElementSelect(element)}
            isPreviewMode={isPreviewMode}
            previewData={previewData}
          />
        ))}
      </div>
    </div>
  );
}

interface CanvasElementProps {
  element: FigmaElement;
  zoom: number;
  isSelected: boolean;
  isMapped: boolean;
  mappedVariable?: string;
  onClick: () => void;
  isPreviewMode?: boolean;
  previewData?: InvoiceData;
}

function CanvasElement({
  element,
  zoom,
  isSelected,
  isMapped,
  mappedVariable,
  onClick,
  isPreviewMode = false,
  previewData,
}: CanvasElementProps) {
  const isText = element.type === "TEXT";
  const isClickable = isText;

  // Get display content
  let displayContent = element.content || "";

  if (isMapped && mappedVariable) {
    if (isPreviewMode && previewData) {
      // In preview mode, show actual data
      displayContent = getInvoiceValue(previewData, mappedVariable as VariableName);
    } else {
      // In edit mode, show variable placeholder
      displayContent = `{${mappedVariable}}`;
    }
  }

  // Build styles
  const style: React.CSSProperties = {
    position: "absolute",
    left: element.x * zoom,
    top: element.y * zoom,
    width: element.width * zoom,
    height: element.height * zoom,
  };

  // Add element-specific styles
  if (element.style) {
    if (element.style.backgroundColor && !isText) {
      style.backgroundColor = element.style.backgroundColor;
    }
    if (element.style.color && isText) {
      style.color = element.style.color;
    }
    if (element.style.fontSize) {
      style.fontSize = element.style.fontSize * zoom;
    }
    if (element.style.fontFamily) {
      style.fontFamily = element.style.fontFamily;
    }
    if (element.style.fontWeight) {
      style.fontWeight = element.style.fontWeight;
    }
    if (element.style.opacity !== undefined) {
      style.opacity = element.style.opacity;
    }
  }

  // Non-text elements (backgrounds, shapes)
  if (!isText) {
    return (
      <div
        style={style}
        className={cn(
          "pointer-events-none",
          element.type === "RECTANGLE" && "rounded-sm",
          element.type === "ELLIPSE" && "rounded-full"
        )}
      />
    );
  }

  // Text elements
  return (
    <div
      style={style}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className={cn(
        "cursor-pointer transition-all overflow-hidden",
        "flex items-start",
        // Selection ring
        isSelected && "ring-2 ring-blue-500 ring-offset-1",
        // Mapped indicator
        isMapped && !isSelected && "ring-1 ring-green-500/50",
        // Hover effect
        isClickable && "hover:bg-blue-500/10"
      )}
    >
      <span
        className={cn(
          "whitespace-pre-wrap break-words leading-tight",
          isMapped && !isPreviewMode && "text-green-600 font-medium"
        )}
        style={{
          fontSize: style.fontSize,
          fontFamily: style.fontFamily,
          fontWeight: style.fontWeight,
          color: isMapped && !isPreviewMode ? undefined : style.color,
        }}
      >
        {displayContent}
      </span>

      {/* Mapping badge */}
      {isMapped && (
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
      )}
    </div>
  );
}
