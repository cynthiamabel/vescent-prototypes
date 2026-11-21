"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useInfiniteQuery, useMutation, useQuery } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import {
  AlertCircle,
  Loader2,
  MessageSquare,
  Pencil,
  Send,
  Video,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { useMessages } from "@/hooks/use-messages";
import { useTwilio } from "@/contexts/twilio-context";
import { useAuth } from "@/hooks/use-auth";
import {
  searchUsers,
  createConversation,
  createConversationVideoRoom,
  listConversations,
} from "@vescent/shared";
import type {
  ConversationParticipant,
  TwilioConversation,
  TwilioMessage,
  UserListItem,
} from "@vescent/shared";
import { Avatar } from "@/components/ui/avatar";
import { ReportButton } from "@/components/safety/report-button";
import { BlockUserButton } from "@/components/safety/block-user-button";
import { Button } from "@/components/ui/button";
import { ParticipantAvatarStack } from "@/components/ui/participant-avatar-stack";

// --- Conversation list item ---

function ConversationListItem({
  meta,
  currentUserId,
  active,
  onSelect,
}: {
  meta: TwilioConversation | undefined;
  currentUserId: string | undefined;
  active: boolean;
  onSelect: () => void;
}) {
  const allParticipants = meta?.participants ?? [];
  const otherParticipants = allParticipants.filter(
    (participant) => participant.id !== currentUserId,
  );
  const participants =
    otherParticipants.length > 0 ? otherParticipants : allParticipants;
  const displayName = participants
    .map((p) => {
      const fullName = `${p.firstName ?? ""} ${p.lastName ?? ""}`.trim();
      return fullName || p.username;
    })
    .join(", ");
  const isUnread = (meta?.unreadCount ?? 0) > 0;

  return (
    <Button
      variant="ghost"
      onClick={onSelect}
      className={`h-auto min-h-14 w-full justify-start whitespace-normal text-left px-4 py-3 hover:bg-muted transition-colors border-b border-border last:border-0 flex items-center gap-3 ${
        active ? "bg-muted" : ""
      }`}
    >
      <div className="flex w-14 shrink-0">
        {!meta ? (
          <Loader2 className="h-5 w-5 shrink-0 animate-spin text-muted-foreground" />
        ) : participants.length > 0 ? (
          <ParticipantAvatarStack participants={participants} />
        ) : (
          <div className="h-7 w-7 rounded-full bg-muted shrink-0" />
        )}
      </div>
      <span
        className={`h-2 w-2 shrink-0 rounded-full ${
          isUnread ? "bg-primary" : "bg-transparent"
        }`}
      />
      <p
        className={`min-w-0 flex-1 truncate text-sm ${
          isUnread ? "font-semibold" : "font-medium"
        } ${meta ? "" : "text-muted-foreground"}`}
      >
        {meta ? displayName || "Conversation" : "Loading conversation..."}
      </p>
    </Button>
  );
}

// --- Message bubble with avatar ---

function MessageBubble({
  message,
  isOwn,
  author,
}: {
  message: TwilioMessage;
  isOwn: boolean;
  author: {
    id: string;
    username: string;
    profilePictureUrl?: string | null;
  } | null;
}) {
  const router = useRouter();
  const interventionCards = Array.isArray(message.safetyIntervention?.cards)
    ? (message.safetyIntervention.cards as Array<Record<string, unknown>>)
    : [];
  return (
    <div
      className={`flex items-end gap-2 mb-3 ${isOwn ? "flex-row-reverse" : "flex-row"}`}
    >
      {author && (
        <Avatar
          src={author.profilePictureUrl}
          username={author.username}
          size="md"
          onClick={() => router.push(`/app/profile/${author.id}`)}
        />
      )}
      <div
        className={`max-w-[65%] px-4 py-2 rounded-2xl text-sm ${
          isOwn
            ? "bg-primary text-primary-foreground rounded-br-sm"
            : "bg-muted text-foreground rounded-bl-sm"
        }`}
      >
        {message.moderationStatus === "removed" ? (
          <div className="space-y-2">
            <p>{message.moderationReason?.includes("self_harm_risk") ? "Your message was not sent. Support is available now." : "Your message was not sent and is under review."}</p>
            {message.safetyIntervention ? (
              <div className="rounded-md bg-background/40 p-2 text-xs">
                <p className="font-medium">{String(message.safetyIntervention.title ?? "Support")}</p>
                <p>{String(message.safetyIntervention.message ?? "")}</p>
                {interventionCards.length ? (
                  <div className="mt-2 space-y-1">
                    {interventionCards.map((card, index) => (
                      <div key={index}>
                        <p className="font-medium">{String(card.label ?? "Support option")}</p>
                        <p>{String(card.body ?? "")}</p>
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>
        ) : (
          message.body
        )}
        {!isOwn && (
          <div className="mt-1">
            <ReportButton
              targetType="message"
              targetId={message.sid}
              reportedUserId={author?.id ?? null}
            />
            {author?.id && <BlockUserButton userId={author.id} />}
          </div>
        )}
      </div>
    </div>
  );
}

// --- Message input ---

function MessageInput({ onSend }: { onSend: (body: string) => void }) {
  const [text, setText] = useState("");

  const submit = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    onSend(trimmed);
    setText("");
  };

  return (
    <div className="flex items-center gap-2 p-4 border-t border-border">
      <input
        className="flex-1 rounded-full border border-input bg-background px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
        placeholder="Type a message…"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            submit();
          }
        }}
      />
      <Button
        size="icon"
        onClick={submit}
        disabled={!text.trim()}
        className="p-2 rounded-full bg-primary text-primary-foreground disabled:opacity-40"
      >
        <Send className="h-4 w-4" />
      </Button>
    </div>
  );
}

// --- Thread panel ---

function ThreadPanel({
  sid,
  participants,
}: {
  sid: string;
  participants: ConversationParticipant[];
}) {
  const { user } = useAuth();
  const router = useRouter();
  const { messages, sendMessage, loading, loadMore, hasMore, loadingMore } = useMessages(sid);
  const bottomRef = useRef<HTMLDivElement>(null);
  const videoMutation = useMutation({
    mutationFn: () => createConversationVideoRoom(sid),
    onSuccess: (room) => router.push(`/app/video/${room.id}`),
    onError: (error: Error) =>
      toast.error("Could not start call", { description: error.message }),
  });
  const otherParticipants = participants.filter(
    (participant) => participant.id !== user?.id,
  );
  const title =
    otherParticipants
      .map((participant) => {
        const fullName =
          `${participant.firstName ?? ""} ${participant.lastName ?? ""}`.trim();
        return fullName || participant.username;
      })
      .join(", ") || "Message";

  // Build lookup: userId → display info
  const participantMap = useMemo(() => {
    const map = new Map<string, ConversationParticipant>();
    participants.forEach((p) => map.set(p.id, p));
    return map;
  }, [participants]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-3 border-b border-border px-4 py-3">
        <h2 className="flex-1 truncate font-heading text-base">{title}</h2>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Start video call"
          title="Start video call"
          onClick={() => videoMutation.mutate()}
          disabled={videoMutation.isPending}
        >
          {videoMutation.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Video className="h-4 w-4" />
          )}
        </Button>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : messages.length === 0 ? (
          <p className="text-center text-muted-foreground text-sm py-8">
            No messages yet. Say hello!
          </p>
        ) : (
          <>
            {hasMore ? (
              <div className="mb-4 flex justify-center">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={loadMore}
                  disabled={loadingMore}
                >
                  {loadingMore ? "Loading..." : "Load older messages"}
                </Button>
              </div>
            ) : null}
            {messages.map((msg) => {
              const isOwn = msg.author === user?.id;
              const author = isOwn
                ? user
                  ? {
                      id: user.id,
                      username: user.username,
                      profilePictureUrl: user.profilePictureUrl,
                    }
                  : null
                : (participantMap.get(msg.author ?? "") ?? null);
              return (
                <MessageBubble
                  key={msg.sid}
                  message={msg}
                  isOwn={isOwn}
                  author={author}
                />
              );
            })}
          </>
        )}
        <div ref={bottomRef} />
      </div>
      <MessageInput onSend={sendMessage} />
    </div>
  );
}

// --- New message overlay ---

function NewMessageOverlay({
  onClose,
  onConversationOpened,
}: {
  onClose: () => void;
  onConversationOpened: (sid: string) => void;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<UserListItem[]>([]);
  const [selected, setSelected] = useState<UserListItem[]>([]);
  const [searching, setSearching] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [banner, setBanner] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!query.trim()) {
      setResults([]);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        const users = await searchUsers({ search: query.trim(), pageSize: 20 });
        // Filter out already-selected users
        setResults(users.items.filter((u) => !selected.some((s) => s.id === u.id)));
      } finally {
        setSearching(false);
      }
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, selected]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const addUser = (u: UserListItem) => {
    setSelected((prev) => [...prev, u]);
    setQuery("");
    setResults([]);
    setBanner(null);
    inputRef.current?.focus();
  };

  const removeUser = (id: string) => {
    setSelected((prev) => prev.filter((u) => u.id !== id));
    setBanner(null);
  };

  const startChat = async () => {
    if (!selected.length || submitting) return;
    setSubmitting(true);
    setBanner(null);
    try {
      const conv = await createConversation({
        otherUserIds: selected.map((u) => u.id),
      });
      if (!conv.created) {
        setBanner(
          "A conversation with these people already exists — opening it now.",
        );
        setTimeout(() => onConversationOpened(conv.conversationSid), 1200);
      } else {
        onConversationOpened(conv.conversationSid);
      }
    } catch {
      setBanner("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <div className="absolute inset-0 z-10" onClick={onClose} />
      <div className="absolute inset-x-0 top-0 z-20 bg-background border-b border-border shadow-lg">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-border">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            New Message
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Selected chips */}
        {selected.length > 0 && (
          <div className="flex flex-wrap gap-1.5 px-3 pt-2">
            {selected.map((u) => (
              <span
                key={u.id}
                className="flex items-center gap-1 bg-primary/10 text-primary text-xs font-medium px-2 py-1 rounded-full"
              >
                @{u.username}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeUser(u.id)}
                  className="hover:text-primary/60"
                >
                  <X className="h-3 w-3" />
                </Button>
              </span>
            ))}
          </div>
        )}

        {/* Search input */}
        <div className="flex items-center gap-2 px-3 py-2">
          <input
            ref={inputRef}
            className="flex-1 text-sm outline-none bg-transparent placeholder:text-muted-foreground"
            placeholder="Search by name or username…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {searching && (
            <Loader2 className="h-3 w-3 animate-spin text-muted-foreground shrink-0" />
          )}
        </div>

        {/* Banner */}
        {banner && (
          <div className="mx-3 mb-2 px-3 py-2 rounded-md bg-amber-50 border border-amber-200 text-amber-800 text-xs">
            {banner}
          </div>
        )}

        {/* Search results */}
        <div className="max-h-48 overflow-y-auto">
          {!searching && query.trim() && results.length === 0 && (
            <p className="text-xs text-muted-foreground text-center py-3">
              No users found
            </p>
          )}
          {results.map((u) => (
            <Button
              variant="outline"
              size="sm"
              key={u.id}
              onClick={() => addUser(u)}
              className="w-full flex items-center gap-3 px-4 py-2 hover:bg-muted text-left transition-colors"
            >
              <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold text-primary shrink-0">
                {u.username.charAt(0).toUpperCase()}
              </div>
              <span className="text-sm font-medium truncate">
                @{u.username}
              </span>
            </Button>
          ))}
        </div>

        {/* Start chat button */}
        {selected.length > 0 && (
          <div className="px-3 pb-3 pt-1">
            <Button
              size="sm"
              onClick={startChat}
              disabled={submitting}
              className="w-full bg-primary text-primary-foreground text-sm font-medium py-2 rounded-lg hover:bg-primary/90 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {submitting && <Loader2 className="h-3 w-3 animate-spin" />}
              {submitting
                ? "Opening…"
                : `Start Chat${selected.length > 1 ? ` (${selected.length + 1} people)` : ""}`}
            </Button>
          </div>
        )}
      </div>
    </>
  );
}

// --- Page ---

function MessagesContent() {
  const { status } = useTwilio();
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();
  const activeSid = searchParams.get("sid");
  const [showNewMessage, setShowNewMessage] = useState(false);

  // Fetch fresh participant metadata from our API
  const {
    data: conversationMeta,
    isPending: isMetaPending,
    isError: isMetaError,
    refetch: refetchMeta,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ["conversations-meta"],
    queryFn: ({ pageParam }) => listConversations({ pageToken: pageParam }),
    getNextPageParam: (lastPage) =>
      lastPage.hasNextPage ? lastPage.nextPageToken : undefined,
    initialPageParam: null as string | null,
    enabled: status === "ready",
  });

  const conversations = conversationMeta?.pages.flatMap((page) => page.items) ?? [];
  const metaMap = useMemo(() => {
    const map = new Map<string, TwilioConversation>();
    conversations.forEach((c) => map.set(c.conversationSid, c));
    return map;
  }, [conversations]);

  const activeParticipants = activeSid
    ? (metaMap.get(activeSid)?.participants ?? [])
    : [];

  if (
    status === "initializing" ||
    status === "idle" ||
    (status === "ready" && isMetaPending)
  ) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (status === "error" || isMetaError) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex items-center gap-2 text-destructive">
          <AlertCircle className="h-5 w-5" />
          <p className="text-sm">
            Messaging is unavailable. Please try again later.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-6rem)] border border-border rounded-lg overflow-hidden">
      {/* Conversation list */}
      <aside className="w-72 border-r border-border flex flex-col shrink-0 relative">
        <div className="px-4 py-3 border-b border-border flex items-center justify-between">
          <h2 className="font-semibold text-sm">Messages</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowNewMessage(true)}
            className="text-muted-foreground hover:text-foreground transition-colors"
            title="New message"
          >
            <Pencil className="h-4 w-4" />
          </Button>
        </div>

        {showNewMessage && (
          <NewMessageOverlay
            onClose={() => setShowNewMessage(false)}
            onConversationOpened={(sid) => {
              setShowNewMessage(false);
              void refetchMeta();
              router.push(`/app/messages?sid=${sid}`);
            }}
          />
        )}

        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 ? (
            <div className="flex flex-col items-center py-12 px-4 text-center">
              <MessageSquare className="h-10 w-10 text-muted-foreground opacity-40 mb-2" />
              <p className="text-xs text-muted-foreground">
                No conversations yet. Hit the pencil icon to start one.
              </p>
            </div>
          ) : (
            <>
              {conversations.map((conv) => (
                <ConversationListItem
                  key={conv.conversationSid}
                  meta={conv}
                  currentUserId={user?.id}
                  active={conv.conversationSid === activeSid}
                  onSelect={() => router.push(`/app/messages?sid=${conv.conversationSid}`)}
                />
              ))}
              {hasNextPage ? (
                <div className="p-3">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="w-full"
                    disabled={isFetchingNextPage}
                    onClick={() => fetchNextPage()}
                  >
                    {isFetchingNextPage ? "Loading..." : "Load more"}
                  </Button>
                </div>
              ) : null}
            </>
          )}
        </div>
      </aside>

      {/* Thread */}
      <main className="flex-1 flex flex-col">
        {activeSid ? (
          <ThreadPanel sid={activeSid} participants={activeParticipants} />
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center px-6">
            <MessageSquare className="h-12 w-12 text-muted-foreground opacity-40 mb-3" />
            <p className="text-sm text-muted-foreground">
              Select a conversation or hit the pencil icon to start one.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}

export default function MessagesPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <MessagesContent />
    </Suspense>
  );
}
