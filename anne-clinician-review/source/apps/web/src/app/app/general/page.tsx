"use client";

import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { getGroupPosts, getMyGeneralGroup } from "@vescent/shared";
import { Users } from "lucide-react";

import { PostCard } from "@/components/feed/post-card";
import { CreatePostForm } from "@/components/feed/create-post-form";
import { Skeleton } from "@/components/ui/skeleton";
import { InfiniteScrollSentinel } from "@/components/ui/infinite-scroll-sentinel";

export default function GeneralCirclePage() {
  const { data: group, isLoading, isError, error } = useQuery({
    queryKey: ["groups", "my", "general"],
    queryFn: getMyGeneralGroup,
  });
  const {
    data: postPages,
    isLoading: postsLoading,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  } = useInfiniteQuery({
    queryKey: ["group-posts", group?.id],
    queryFn: ({ pageParam }) =>
      getGroupPosts(group?.id ?? 0, { page: pageParam, pageSize: 20 }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.hasNextPage ? lastPage.page + 1 : undefined,
    enabled: Boolean(group?.id),
  });
  const posts = postPages?.pages.flatMap((page) => page.items) ?? [];

  if (isLoading) return <Skeleton className="h-64 w-full" />;
  if (isError || !group) {
    return (
      <p className="text-center text-muted-foreground">
        {error instanceof Error ? error.message : "Could not load General Circle."}
      </p>
    );
  }

  return (
    <section>
      <header className="mb-6">
        <h1 className="font-heading text-3xl">{group.name}</h1>
        <div className="mt-2 flex items-center gap-1 text-sm text-muted-foreground">
          <Users className="h-4 w-4" />
          <span>{group.memberCount} members</span>
        </div>
      </header>
      <CreatePostForm groupId={group.id} />
      {postsLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      ) : posts.length === 0 ? (
        <p className="py-12 text-center text-muted-foreground">
          No posts in General Circle yet.
        </p>
      ) : (
        <>
          {posts.map((post) => <PostCard key={post.id} post={post} />)}
          <InfiniteScrollSentinel
            hasNextPage={Boolean(hasNextPage)}
            isFetchingNextPage={isFetchingNextPage}
            onLoadMore={() => void fetchNextPage()}
          />
        </>
      )}
    </section>
  );
}
