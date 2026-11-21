"use client";

import { useState } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { getMyGroups } from "@vescent/shared";
import { GroupCard } from "@/components/groups/group-card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { InfiniteScrollSentinel } from "@/components/ui/infinite-scroll-sentinel";
import { useDebouncedValue } from "@/hooks/use-debounced-value";

export default function GroupsPage() {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search);

  const { data, isLoading: loading, hasNextPage, isFetchingNextPage, fetchNextPage } = useInfiniteQuery({
    queryKey: ["groups", "my", debouncedSearch],
    queryFn: ({ pageParam }) =>
      getMyGroups({ page: pageParam, pageSize: 20, search: debouncedSearch }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.hasNextPage ? lastPage.page + 1 : undefined,
  });
  const groups = data?.pages.flatMap((page) => page.items) ?? [];

  return (
    <div>
      <div className="mb-4">
        <h1 className="font-heading text-3xl">Your circles</h1>
        <p className="text-muted-foreground">
          Your mentor spaces and shared circles.
        </p>
      </div>
      <Input
        placeholder="Search circles..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mb-4"
      />
      {loading ? (
        <div className="grid grid-cols-1 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {groups.map((g) => (
            <GroupCard key={g.id} group={g} />
          ))}
          {!loading && groups.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-10">
              {debouncedSearch ? "No circles match your search." : "Your circle is being created."}
            </p>
          )}
          <InfiniteScrollSentinel
            hasNextPage={Boolean(hasNextPage)}
            isFetchingNextPage={isFetchingNextPage}
            onLoadMore={() => void fetchNextPage()}
          />
        </div>
      )}
    </div>
  );
}
