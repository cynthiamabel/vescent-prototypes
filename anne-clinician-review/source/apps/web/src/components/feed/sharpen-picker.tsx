"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, X } from "lucide-react";
import {
  cleanSharpenText,
  searchSharpenCatalog,
  sharpenDisplayTitle,
  type SharpenCatalogItem,
} from "@vescent/shared";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

interface SharpenPickerProps {
  open: boolean;
  onClose: () => void;
  onSelect: (item: SharpenCatalogItem) => void;
}

export function SharpenPicker({ open, onClose, onSelect }: SharpenPickerProps) {
  const [query, setQuery] = useState("");
  const { data, isLoading } = useQuery({
    queryKey: ["sharpen-catalog", query],
    queryFn: () => searchSharpenCatalog(query),
    enabled: open,
  });

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm">
      <div className="mx-auto mt-16 max-w-2xl rounded-lg border bg-background shadow-lg">
        <div className="flex items-center justify-between border-b p-4">
          <h2 className="font-heading text-xl">Sharpen</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="space-y-4 p-4">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search modules"
              className="pl-9"
            />
          </div>
          <div className="max-h-[60vh] space-y-2 overflow-auto">
            {isLoading ? (
              <p className="p-4 text-sm text-muted-foreground">Loading Sharpen catalog...</p>
            ) : data?.items.length ? (
              data.items.map((item) => (
                <Button
                  key={item.moduleId}
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    onSelect(item);
                    onClose();
                  }}
                  className="h-auto w-full justify-start p-0 text-left hover:bg-transparent"
                >
                  <Card className="transition-colors hover:bg-accent/40">
                    <CardContent className="flex gap-3 p-3">
                      <div className="h-20 w-28 shrink-0 overflow-hidden rounded-md bg-muted">
                        {item.videoThumbnail || item.bannerImage ? (
                          <img
                            src={item.videoThumbnail ?? item.bannerImage ?? ""}
                            alt=""
                            className="h-full w-full object-cover"
                          />
                        ) : null}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold">{sharpenDisplayTitle(item.videoTitle || item.title)}</p>
                        <p className="mt-1 truncate text-xs text-muted-foreground">
                          {cleanSharpenText(item.trackTitle) || "Sharpen"}
                          {item.videoDuration ? ` · ${item.videoDuration}` : ""}
                        </p>
                        {item.description ? (
                          <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                            {cleanSharpenText(item.description)}
                          </p>
                        ) : null}
                      </div>
                    </CardContent>
                  </Card>
                </Button>
              ))
            ) : (
              <p className="p-4 text-sm text-muted-foreground">No Sharpen modules found.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function SelectedSharpenAttachment({
  item,
  onRemove,
}: {
  item: SharpenCatalogItem;
  onRemove: () => void;
}) {
  return (
    <div className="mt-2 flex items-center gap-3 rounded-md border bg-muted/40 p-2">
      <div className="h-12 w-16 shrink-0 overflow-hidden rounded bg-muted">
        {item.videoThumbnail || item.bannerImage ? (
          <img
            src={item.videoThumbnail ?? item.bannerImage ?? ""}
            alt=""
            className="h-full w-full object-cover"
          />
        ) : null}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold">{sharpenDisplayTitle(item.videoTitle || item.title)}</p>
        <p className="text-xs text-muted-foreground">Sharpen module attached</p>
      </div>
      <Button variant="ghost" size="icon" onClick={onRemove}>
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
}
