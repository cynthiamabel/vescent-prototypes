"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import {
  getHome,
  recordUsageEvent,
  type HomeActivityItem,
  type HomeContent,
} from "@vescent/shared";

import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { FullscreenImageViewer } from "@/components/ui/fullscreen-image-viewer";

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Morning";
  if (hour < 17) return "Afternoon";
  return "Evening";
}

function ActivityCard({ item }: { item: HomeActivityItem }) {
  const [viewerOpen, setViewerOpen] = useState(false);
  const href =
    item.targetType === "conversation" && item.targetId
      ? `/app/messages?sid=${encodeURIComponent(item.targetId)}`
      : item.targetType === "post" && item.postId
        ? `/app/posts/${item.postId}`
        : `/app/groups/${item.groupId}`;
  return (
    <>
      <Card className="transition-colors hover:bg-accent/40">
        <CardContent className="flex items-center gap-4 p-4">
          <Button
            type="button"
            variant="ghost"
            className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-muted p-0"
            aria-label={item.imageUrl ? `View ${item.groupName || item.title} image` : undefined}
            onClick={() => item.imageUrl && setViewerOpen(true)}
            disabled={!item.imageUrl}
          >
            {item.imageUrl ? (
              <img src={item.imageUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              <span className="line-clamp-2 text-center text-[10px] font-semibold text-muted-foreground">
                {item.groupName || item.title}
              </span>
            )}
          </Button>
          <Link href={href} className="flex min-w-0 flex-1 items-center gap-4">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <p className="truncate font-semibold">{item.title}</p>
              <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                {item.meta ?? "circle"}
              </span>
            </div>
            <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
              {item.summary}
            </p>
          </div>
          <span className="flex items-center gap-1 text-sm font-semibold text-primary">
            Open <ArrowRight className="h-4 w-4" />
          </span>
          </Link>
        </CardContent>
      </Card>
      {item.imageUrl ? (
        <FullscreenImageViewer
          src={item.imageUrl}
          alt={`${item.groupName || item.title} image`}
          open={viewerOpen}
          onOpenChange={setViewerOpen}
        />
      ) : null}
    </>
  );
}

function contentAction(content: HomeContent | null) {
  const action = content?.ctaAction;
  if (!action || typeof action !== "object") return null;
  const type = action.type;
  if (type === "url" && typeof action.url === "string") {
    return { type, href: action.url, external: true };
  }
  if (type === "route" && typeof action.route === "string") {
    return { type, href: action.route, external: false };
  }
  return null;
}

function ContentBlock({
  content,
  subtle,
}: {
  content: HomeContent | null;
  subtle?: boolean;
}) {
  if (!content) return null;
  const action = contentAction(content);
  const card = (
    <Card className={subtle ? "bg-muted/45" : "bg-card"}>
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            {content.label}
          </p>
          {content.ctaLabel && action ? (
            <span className="flex items-center gap-1 text-sm font-semibold text-primary">
              {content.ctaLabel} <ArrowRight className="h-4 w-4" />
            </span>
          ) : null}
        </div>
        <h2 className="mt-3 font-heading text-2xl">{content.title}</h2>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">{content.body}</p>
      </CardContent>
    </Card>
  );

  if (!action) return card;
  if (action.external) {
    return (
      <a href={action.href} target="_blank" rel="noreferrer">
        {card}
      </a>
    );
  }
  return <Link href={action.href}>{card}</Link>;
}

export default function HomePage() {
  const { user } = useAuth();
  const { data, isLoading } = useQuery({
    queryKey: ["home"],
    queryFn: getHome,
  });
  const activities = data?.newForYou ?? [];

  useEffect(() => {
    if (!user) return;
    void recordUsageEvent({
      eventType: "app_home_viewed",
      source: "client",
      targetType: "home",
      targetId: "home",
    });
  }, [user]);

  return (
    <section className="mx-auto max-w-3xl space-y-8">
      <div className="flex items-center justify-between">
        <p className="font-heading text-3xl">vescent</p>
      </div>

      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="font-heading text-4xl">
            {greeting()}, {user?.firstName ?? "there"}.
          </h1>
          <p className="mt-3 text-xs font-semibold uppercase tracking-widest text-primary">
            New for you
          </p>
        </div>
        {activities.length ? (
          <p className="text-sm text-muted-foreground">{activities.length} new</p>
        ) : null}
      </div>

      <div className="space-y-3">
        {isLoading ? (
          <Card>
            <CardContent className="p-5 text-sm text-muted-foreground">
              Loading your circles...
            </CardContent>
          </Card>
        ) : activities.length ? (
          activities.map((item) => <ActivityCard key={item.id} item={item} />)
        ) : (
          <Card>
            <CardContent className="p-5 text-sm text-muted-foreground">
              Your circles are quiet right now.
            </CardContent>
          </Card>
        )}
      </div>

      <div>
        <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-primary">
          Gratitude thought of the day
        </p>
        <ContentBlock content={data?.gratitude ?? null} subtle />
      </div>

      <div>
        <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-primary">
          Quick reads
        </p>
        <ContentBlock content={data?.quickRead ?? null} />
      </div>
    </section>
  );
}
