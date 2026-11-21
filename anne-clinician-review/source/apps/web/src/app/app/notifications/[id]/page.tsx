"use client";

import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, ShieldAlert } from "lucide-react";
import { getNotification } from "@vescent/shared";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export default function NotificationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const notificationId = Number(id);
  const { data: notification, isLoading, isError } = useQuery({
    queryKey: ["notification", notificationId],
    queryFn: () => getNotification(notificationId),
    enabled: Number.isFinite(notificationId) && notificationId > 0,
  });
  const metadata = notification?.metadataJson ?? {};
  const removedContent =
    typeof metadata.removedContentBody === "string"
      ? metadata.removedContentBody
      : typeof metadata.removedContentPreview === "string"
        ? metadata.removedContentPreview
        : null;
  const removedContentType =
    typeof metadata.removedContentType === "string" ? metadata.removedContentType : null;
  const removedMediaPreview =
    typeof metadata.removedMediaPreview === "string" ? metadata.removedMediaPreview : null;
  const removalReason =
    typeof metadata.removalReason === "string" ? metadata.removalReason : null;
  const categories = Array.isArray(metadata.categories) ? metadata.categories : [];
  const isSelfHarm = categories.includes("self_harm_risk");
  const intervention =
    metadata.intervention && typeof metadata.intervention === "object"
      ? (metadata.intervention as Record<string, unknown>)
      : null;
  const interventionCards = Array.isArray(intervention?.cards)
    ? (intervention.cards as Array<Record<string, unknown>>)
    : [];

  return (
    <div>
      <div className="mb-4 flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          aria-label="Go back"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="font-heading text-lg">Safety Notice</h1>
      </div>

      {isLoading ? (
        <Skeleton className="h-48 w-full" />
      ) : isError || !notification ? (
        <p className="py-12 text-center text-muted-foreground">
          This notification is unavailable.
        </p>
      ) : (
        <div className="max-w-2xl space-y-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-md bg-muted">
            <ShieldAlert className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h2 className="font-heading text-xl">
              {notification.title ?? "Content under review"}
            </h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {notification.body ?? notification.notificationText}
            </p>
          </div>
          {removedContent || removedMediaPreview ? (
            <div className="rounded-md border bg-card p-4">
              <p className="text-xs font-medium uppercase text-muted-foreground">
                Removed {removedContentType ?? "content"}
              </p>
              {removedContent ? <p className="mt-2 whitespace-pre-wrap text-sm leading-6">{removedContent}</p> : null}
              {removedMediaPreview ? <p className="mt-2 text-sm leading-6">{removedMediaPreview}</p> : null}
            </div>
          ) : null}
          {removalReason ? (
            <div className="rounded-md border bg-card p-4">
              <p className="text-xs font-medium uppercase text-muted-foreground">Why it was removed</p>
              <p className="mt-2 text-sm leading-6">{removalReason}</p>
            </div>
          ) : null}
          {isSelfHarm && intervention ? (
            <div className="rounded-md border bg-card p-4">
              <p className="text-xs font-medium uppercase text-muted-foreground">Support</p>
              <p className="mt-2 font-medium">{String(intervention.title ?? "You are not alone")}</p>
              <p className="mt-2 text-sm leading-6">{String(intervention.message ?? "")}</p>
              {interventionCards.length ? (
                <div className="mt-3 space-y-2">
                  {interventionCards.map((card, index) => (
                    <div key={index} className="rounded-md bg-muted p-3">
                      <p className="text-sm font-medium">{String(card.label ?? "Support option")}</p>
                      <p className="mt-1 text-sm leading-6 text-muted-foreground">{String(card.body ?? "")}</p>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
