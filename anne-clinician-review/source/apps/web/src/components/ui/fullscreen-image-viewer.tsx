"use client";

import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

import { Button } from "@/components/ui/button";

interface FullscreenImageViewerProps {
  src: string;
  alt: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function FullscreenImageViewer({
  src,
  alt,
  open,
  onOpenChange,
}: FullscreenImageViewerProps) {
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (!open) return;
    previousFocusRef.current = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onOpenChange(false);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
      previousFocusRef.current?.focus();
    };
  }, [open, onOpenChange]);

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex h-[100dvh] w-screen items-center justify-center bg-background/95 p-4"
      role="dialog"
      aria-modal="true"
      aria-label={alt || "Fullscreen image"}
      data-testid="fullscreen-image-viewer"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onOpenChange(false);
      }}
    >
      <Button
        ref={closeButtonRef}
        type="button"
        variant="secondary"
        size="icon"
        className="absolute right-4 top-4 z-10"
        aria-label="Close fullscreen image"
        onClick={() => onOpenChange(false)}
      >
        <X className="h-5 w-5" />
      </Button>
      <img
        src={src}
        alt={alt}
        className="max-h-[calc(100dvh-2rem)] max-w-[calc(100vw-2rem)] object-contain"
      />
    </div>,
    document.body,
  );
}
