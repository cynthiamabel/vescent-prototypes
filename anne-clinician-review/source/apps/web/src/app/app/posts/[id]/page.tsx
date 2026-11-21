"use client";

import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { getPost } from "@vescent/shared";

import { PostCard } from "@/components/feed/post-card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export default function PostDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const postId = Number(id);
  const {
    data: post,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["post", postId],
    queryFn: () => getPost(postId),
    enabled: Number.isFinite(postId) && postId > 0,
  });

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
        <h1 className="font-heading text-lg">Post</h1>
      </div>

      {isLoading ? (
        <Skeleton className="h-64 w-full" />
      ) : isError || !post ? (
        <p className="py-12 text-center text-muted-foreground">
          This post is unavailable.
        </p>
      ) : (
        <PostCard post={post} commentsExpanded />
      )}
    </div>
  );
}
