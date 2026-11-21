"use client";

import { useMemo, useState } from "react";
import { useInfiniteQuery, useMutation, useQuery } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, MessageSquare, Search, Users } from "lucide-react";
import { createConversation, getGroup, getGroupMembers, type GroupMember } from "@vescent/shared";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { InfiniteScrollSentinel } from "@/components/ui/infinite-scroll-sentinel";
import { useDebouncedValue } from "@/hooks/use-debounced-value";

function tierLabel(member: GroupMember): string {
  if (member.memberRole === "mentor") return "Mentor";
  if (member.userTier === "premium") return "Premium User";
  if (member.userTier === "basic") return "Basic User";
  if (member.userTier === "free") return "Free User";
  return "User";
}

function MemberRow({ member }: { member: GroupMember }) {
  const router = useRouter();
  const messageMutation = useMutation({
    mutationFn: () => createConversation({ otherUserIds: [member.id] }),
    onSuccess: (conversation) =>
      router.push(`/app/messages?sid=${encodeURIComponent(conversation.conversationSid)}`),
  });
  return (
    <div className="flex items-center gap-3 border-t py-3 first:border-t-0">
      <Avatar
        src={member.profilePictureUrl}
        firstName={member.firstName}
        lastName={member.lastName}
        username={member.username}
        size="md"
        expandable
      />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">
          {member.firstName} {member.lastName}
        </p>
        <p className="text-xs text-muted-foreground">
          {tierLabel(member)}
          {member.timezone ? ` · ${member.timezone}` : ""}
        </p>
      </div>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-label={`Message ${member.firstName} ${member.lastName}`}
        onClick={() => messageMutation.mutate()}
        disabled={messageMutation.isPending}
      >
        <MessageSquare className="h-4 w-4" />
      </Button>
    </div>
  );
}

export default function GroupMembersPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const groupId = Number(id);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search);
  const goBack = () => router.replace(`/app/groups/${groupId}`);
  const { data: group, isLoading } = useQuery({
    queryKey: ["group", groupId],
    queryFn: () => getGroup(groupId),
    enabled: Number.isFinite(groupId) && groupId > 0,
  });
  const { data: memberPages, isLoading: membersLoading, hasNextPage, isFetchingNextPage, fetchNextPage } = useInfiniteQuery({
    queryKey: ["group-members", groupId, debouncedSearch],
    queryFn: ({ pageParam }) =>
      getGroupMembers(groupId, { page: pageParam, pageSize: 30, search: debouncedSearch }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.hasNextPage ? lastPage.page + 1 : undefined,
    enabled: Number.isFinite(groupId) && groupId > 0 && Boolean(group),
  });
  const members = memberPages?.pages.flatMap((page) => page.items) ?? [];

  const mentors = useMemo(
    () => members.filter((member) => member.memberRole === "mentor"),
    [members],
  );
  const users = useMemo(
    () => members.filter((member) => member.memberRole === "user"),
    [members],
  );

  if (isLoading) return <Skeleton className="h-64 w-full" />;
  if (!group)
    return <p className="text-center text-muted-foreground">Group not found</p>;

  return (
    <div>
      <div className="mb-6 flex items-start gap-3">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={goBack}
          aria-label="Back to group"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-2xl font-bold">{group.name}</h1>
          <div className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
            <Users className="h-4 w-4" />
            <span>
              {group.memberCount} members · {mentors.length} mentors
            </span>
          </div>
        </div>
      </div>

      <div className="mb-4 flex items-center gap-2">
        <Search className="h-4 w-4 text-muted-foreground" />
        <Input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search members"
        />
      </div>

      {membersLoading ? (
        <Skeleton className="h-40 w-full" />
      ) : (
      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-lg border bg-card/60 p-4">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Mentors
          </h2>
          {mentors.length ? (
            mentors.map((member) => <MemberRow key={member.id} member={member} />)
          ) : (
            <p className="text-sm text-muted-foreground">No mentors found.</p>
          )}
        </section>

        <section className="rounded-lg border bg-card/60 p-4">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Users
          </h2>
          {users.length ? (
            users.map((member) => <MemberRow key={member.id} member={member} />)
          ) : (
            <p className="text-sm text-muted-foreground">No users found.</p>
          )}
        </section>
      </div>
      )}
      <InfiniteScrollSentinel
        hasNextPage={Boolean(hasNextPage)}
        isFetchingNextPage={isFetchingNextPage}
        onLoadMore={() => void fetchNextPage()}
      />
    </div>
  );
}
