"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, Send, Trash2 } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { createReply, deleteReply, getGroupMembers, type PostResponse } from "@vescent/shared";
import { Avatar } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FullscreenImageViewer } from "@/components/ui/fullscreen-image-viewer";
import { useAuth } from "@/hooks/use-auth";
import { SharpenAttachment } from "./sharpen-attachment";
import { ReportButton } from "@/components/safety/report-button";
import { BlockUserButton } from "@/components/safety/block-user-button";

interface PostCardProps {
  post: PostResponse;
  onDelete?: (id: number) => void;
  commentsExpanded?: boolean;
}

export function PostCard({
  post,
  onDelete,
  commentsExpanded = false,
}: PostCardProps) {
  const router = useRouter();
  const { user, isAdmin } = useAuth();
  const queryClient = useQueryClient();
  const [replyText, setReplyText] = useState("");
  const [replies, setReplies] = useState(post.replies);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const mentionMatch = replyText.match(/(?:^|\s)@([a-z0-9_]*)$/i);
  const mentionQuery = mentionMatch?.[1] ?? "";
  const mentionSuggestions = useQuery({
    queryKey: ["reply-mention-search", post.groupId ?? "no-group", mentionQuery],
    queryFn: () => getGroupMembers(post.groupId as number, { search: mentionQuery, pageSize: 5 }),
    enabled: Boolean(commentsExpanded && post.groupId && mentionQuery.length >= 2),
    staleTime: 30_000,
  });

  const insertMention = (username: string) => {
    setReplyText((current) => current.replace(/(?:^|\s)@([a-z0-9_]*)$/i, (match) => {
      const prefix = match.startsWith(" ") ? " " : "";
      return `${prefix}@${username} `;
    }));
  };

  useEffect(() => {
    setReplies(post.replies);
  }, [post.id, post.replies]);

  const invalidatePosts = () => {
    queryClient.invalidateQueries({ queryKey: ["feed"] });
    queryClient.invalidateQueries({ queryKey: ["my-feed"] });
    queryClient.invalidateQueries({ queryKey: ["group-posts"] });
  };

  const replyMutation = useMutation({
    mutationFn: (content: string) => createReply(post.id, { content }),
    onMutate: (content) => {
      const optimisticReply = {
        id: -Date.now(),
        postId: post.id,
        content,
        createdBy: user?.id ?? "",
        authorUsername: user?.username ?? "",
        authorFirstName: user?.firstName ?? "",
        authorLastName: user?.lastName ?? "",
        authorProfilePictureUrl: user?.profilePictureUrl ?? null,
        createdAt: new Date().toISOString(),
        likesCount: 0,
        isLiked: false,
        moderationStatus: "visible" as const,
        moderationReason: null,
      };
      setReplies((current) => [...current, optimisticReply]);
      return { optimisticReplyId: optimisticReply.id };
    },
    onSuccess: (reply, _content, context) => {
      setReplies((current) => current.map((item) =>
        item.id === context.optimisticReplyId ? reply : item,
      ));
      setReplyText("");
      invalidatePosts();
    },
    onError: (_error, _content, context) => {
      setReplies((current) => current.filter((item) => item.id !== context?.optimisticReplyId));
    },
  });
  const deleteReplyMutation = useMutation({
    mutationFn: deleteReply,
    onSuccess: (_result, replyId) => {
      setReplies((current) => current.filter((reply) => reply.id !== replyId));
      invalidatePosts();
    },
  });

  const submitReply = () => {
    const trimmed = replyText.trim();
    if (!trimmed || replyMutation.isPending) return;
    replyMutation.mutate(trimmed);
  };

  const isOwn = user?.id === post.createdBy;
  return (
    <Card className="mb-3">
      <CardContent className="pt-4">
        {/* Header */}
        <div className="flex items-start gap-3 mb-3">
          <Avatar
            src={post.authorProfilePictureUrl}
            firstName={post.authorFirstName}
            lastName={post.authorLastName}
            username={post.authorUsername}
            size="md"
            expandable
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-sm">
                {post.authorUsername}
              </span>
              {post.groupName && (
                <Badge variant="outline" className="text-xs">
                  {post.groupName}
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(post.createdAt), {
                addSuffix: true,
              })}
            </p>
          </div>
          {(isOwn || isAdmin) && onDelete && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDelete(post.id)}
              className="text-muted-foreground hover:text-destructive transition-colors"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Content */}
        {post.content && (
          <p className="text-sm mb-3 whitespace-pre-wrap">{post.content}</p>
        )}
        {post.mediaUrl && (
          <Button
            type="button"
            variant="ghost"
            className="relative mb-3 h-64 w-full overflow-hidden rounded-lg"
            onClick={() => setLightboxOpen(true)}
          >
            <Image
              src={normalizeMediaUrl(post.mediaUrl)}
              alt="Post image"
              fill
              sizes="(min-width: 1024px) 720px, 100vw"
              className="object-cover"
            />
          </Button>
        )}
        {post.sharpenReference && <SharpenAttachment moduleId={post.sharpenReference} />}

        {/* Actions */}
        <div className="flex items-center gap-4 pt-2 border-t">
          <Button
            variant="ghost"
            onClick={() => {
              if (!commentsExpanded) router.push(`/app/posts/${post.id}`);
            }}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            <MessageCircle className="h-4 w-4" />
            <span>{replies.length}</span>
          </Button>
          {!isOwn && (
            <>
              <ReportButton
                targetType="post"
                targetId={String(post.id)}
                reportedUserId={post.createdBy}
              />
              <BlockUserButton userId={post.createdBy} />
            </>
          )}
        </div>

        {/* Replies section */}
        <AnimatePresence>
          {commentsExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mt-3 overflow-hidden"
            >
              {/* Existing replies */}
              {replies.length > 0 && (
                <div className="space-y-2 pl-4 border-l-2 border-muted mb-3">
                  {replies.map((reply) => (
                    <div key={reply.id} className="flex gap-2">
                      <Avatar
                        src={reply.authorProfilePictureUrl}
                        firstName={reply.authorFirstName}
                        lastName={reply.authorLastName}
                        username={reply.authorUsername}
                        size="sm"
                        expandable
                      />
                      <div className="min-w-0 flex-1">
                        <span className="text-xs font-semibold">
                          {reply.authorUsername}
                        </span>
                        <p className="text-xs text-muted-foreground">
                          {reply.content}
                        </p>
                        <div className="mt-1 flex items-center gap-2">
                        {reply.createdBy !== user?.id ? (
                          <>
                            <ReportButton
                              targetType="reply"
                              targetId={String(reply.id)}
                              reportedUserId={reply.createdBy}
                            />
                            <BlockUserButton userId={reply.createdBy} />
                          </>
                        ) : null}
                        {(reply.createdBy === user?.id || isAdmin) && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-auto px-1 py-0 text-xs text-muted-foreground hover:text-destructive"
                            onClick={() => deleteReplyMutation.mutate(reply.id)}
                            disabled={deleteReplyMutation.isPending}
                          >
                            Delete
                          </Button>
                        )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Reply input */}
              <div className="flex items-center gap-2">
                <Avatar
                  src={user?.profilePictureUrl}
                  firstName={user?.firstName}
                  lastName={user?.lastName}
                  username={user?.username ?? ""}
                  size="sm"
                />
                <div className="flex-1 flex items-center gap-2 bg-muted rounded-full px-3 py-1.5">
                  <input
                    className="flex-1 text-xs bg-transparent outline-none placeholder:text-muted-foreground"
                    placeholder="Write a comment…"
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        submitReply();
                      }
                    }}
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={submitReply}
                    disabled={!replyText.trim() || replyMutation.isPending}
                    className="text-primary disabled:opacity-40 shrink-0"
                  >
                    <Send className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              {mentionSuggestions.data?.items.length ? (
                <div className="ml-10 mt-2 rounded-md border bg-background p-1 shadow-sm">
                  {mentionSuggestions.data.items
                    .filter((item) => item.id !== user?.id)
                    .map((item) => (
                      <Button
                        key={item.id}
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-auto w-full justify-start px-2 py-1.5 text-left"
                        onClick={() => insertMention(item.username)}
                      >
                        <span className="min-w-0 truncate">
                          {item.firstName} {item.lastName} @{item.username}
                        </span>
                      </Button>
                    ))}
                </div>
              ) : null}
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
      {post.mediaUrl ? (
        <FullscreenImageViewer
          src={normalizeMediaUrl(post.mediaUrl)}
          alt="Post image"
          open={lightboxOpen}
          onOpenChange={setLightboxOpen}
        />
      ) : null}
    </Card>
  );
}

function normalizeMediaUrl(value: string) {
  try {
    const url = new URL(value);
    const fragment = url.hash.slice(1);
    url.hash = "";
    url.pathname = url.pathname
      .split("/")
      .map((segment) => encodeURIComponent(decodeURIComponent(segment)))
      .join("/");
    if (fragment) url.pathname += `%23${encodeURIComponent(fragment)}`;
    return url.toString();
  } catch {
    return value;
  }
}
