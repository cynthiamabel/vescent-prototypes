"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  getSharpenModule,
  cleanSharpenText,
  sharpenDisplayTitle,
  trackSharpenModuleView,
  type SharpenContentNode,
  type SharpenModule,
  type SharpenVideo,
} from "@vescent/shared";
import { ArrowRight, X } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function SharpenAttachment({ moduleId }: { moduleId: string }) {
  const [open, setOpen] = useState(false);
  const { data, isLoading, isError } = useQuery({
    queryKey: ["sharpen-module", moduleId],
    queryFn: () => getSharpenModule(moduleId),
  });
  const trackMutation = useMutation({
    mutationFn: (module: SharpenModule) => trackSharpenModuleView(module.id, module.title),
  });

  if (isLoading) {
    return (
      <Card className="mb-3 bg-muted/40">
        <CardContent className="p-4 text-sm text-muted-foreground">Loading Sharpen...</CardContent>
      </Card>
    );
  }
  if (isError || !data) {
    return (
      <Card className="mb-3 bg-muted/40">
        <CardContent className="p-4">
          <p className="text-xs font-semibold uppercase tracking-widest text-primary">Sharpen</p>
          <p className="mt-2 text-sm text-muted-foreground">This module could not be loaded.</p>
        </CardContent>
      </Card>
    );
  }

  const openModule = () => {
    setOpen(true);
    if (!trackMutation.isPending) trackMutation.mutate(data);
  };

  return (
    <>
      <Button
        type="button"
        variant="ghost"
        onClick={openModule}
        className="mb-3 h-auto w-full justify-start p-0 text-left hover:bg-transparent"
      >
        <Card className="overflow-hidden transition-colors hover:bg-accent/40">
          {(data.bannerImage || data.videos[0]?.thumbnail) && (
            <img
              src={data.bannerImage ?? data.videos[0]?.thumbnail ?? ""}
              alt=""
              className="h-48 w-full object-cover"
            />
          )}
          <CardContent className="p-4">
            <p className="text-xs font-semibold uppercase tracking-widest text-primary">Sharpen</p>
            <h3 className="mt-2 font-semibold">{sharpenDisplayTitle(data.videos[0]?.title || data.title)}</h3>
            {data.description && (
              <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{cleanSharpenText(data.description)}</p>
            )}
            <span className="mt-3 flex items-center gap-1 text-sm font-semibold text-primary">
              Read more <ArrowRight className="h-4 w-4" />
            </span>
          </CardContent>
        </Card>
      </Button>
      {open && <SharpenModuleDialog module={data} onClose={() => setOpen(false)} />}
    </>
  );
}

function SharpenModuleDialog({ module, onClose }: { module: SharpenModule; onClose: () => void }) {
  const nodes = [...module.intro, ...(module.body?.body ?? []), ...module.outro];
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [onClose]);

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex h-[100dvh] items-center justify-center bg-background/90 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="Sharpen"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="max-h-[calc(100dvh-2rem)] w-full max-w-3xl overflow-hidden rounded-lg border bg-background shadow-lg">
        <div className="flex items-center justify-between border-b p-4">
          <p className="font-heading text-xl">Sharpen</p>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="max-h-[76vh] overflow-auto p-5">
          {module.bannerImage && (
            <img src={module.bannerImage} alt="" className="mb-5 h-64 w-full rounded-lg object-cover" />
          )}
          <h2 className="font-heading text-3xl">{sharpenDisplayTitle(module.title)}</h2>
          {module.description && <p className="mt-3 text-muted-foreground">{cleanSharpenText(module.description)}</p>}
          <div className="mt-5 space-y-4">
            {nodes.map((node, index) => (
              <ContentNode key={`${node.id ?? "node"}-${index}`} node={node} videos={module.videos} />
            ))}
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}

function ContentNode({ node, videos }: { node: SharpenContentNode; videos: SharpenVideo[] }) {
  if (node.type === "section_heading" && typeof node.value === "string") {
    return <h3 className="text-xl font-semibold">{cleanSharpenText(node.value)}</h3>;
  }
  if (node.type === "paragraph" && typeof node.value === "string") {
    return <p className="leading-7 text-muted-foreground">{cleanSharpenText(node.value)}</p>;
  }
  if (node.type === "image" && typeof node.value === "string") {
    return <img src={node.value} alt="" className="w-full rounded-lg" />;
  }
  if (node.type === "quotation" && node.value && typeof node.value === "object") {
    const value = node.value as { quote?: string; author?: string };
    return (
      <blockquote className="border-l-2 pl-4">
        <p className="font-heading text-2xl">{cleanSharpenText(value.quote)}</p>
        {value.author && <footer className="mt-2 text-sm text-muted-foreground">- {cleanSharpenText(value.author)}</footer>}
      </blockquote>
    );
  }
  if (node.type === "video_with_description" && node.value && typeof node.value === "object") {
    const value = node.value as { video?: number; description?: string };
    const video = videos.find((item) => item.id === value.video);
    if (!video) return null;
    if (!video.file) {
      return (
        <div>
          <p className="font-semibold">{video.title ?? "Sharpen video"}</p>
          <p className="mt-1 text-sm text-muted-foreground">This video is not available right now.</p>
        </div>
      );
    }
    return (
      <div>
        <video src={video.file} poster={video.thumbnail ?? undefined} controls className="aspect-video w-full rounded-lg" />
        <p className="mt-2 font-semibold">{video.title}</p>
        {(value.description || video.description) && (
          <p className="mt-1 text-sm text-muted-foreground">{value.description ?? video.description}</p>
        )}
      </div>
    );
  }
  return null;
}
