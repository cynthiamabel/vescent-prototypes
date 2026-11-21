"use client";

import { useState, useRef } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Clapperboard, ImagePlus, Send } from "lucide-react";
import {
  createPost,
  getGroupMembers,
  searchUsers,
  type PostCreate,
  type SharpenCatalogItem,
  type UserListItem,
  UserRole,
} from "@vescent/shared";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { useUpload } from "@/hooks/use-upload";
import { SelectedSharpenAttachment, SharpenPicker } from "./sharpen-picker";

interface CreatePostFormProps {
  groupId?: number;
  onSuccess?: () => void;
}

type MentionSuggestion = Pick<UserListItem, "id" | "username" | "firstName" | "lastName" | "profilePictureUrl">;

export function CreatePostForm({ groupId, onSuccess }: CreatePostFormProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { uploadFile, uploading } = useUpload();
  const [content, setContent] = useState("");
  const [mediaUrl, setMediaUrl] = useState<string | null>(null);
  const [sharpenAttachment, setSharpenAttachment] = useState<SharpenCatalogItem | null>(null);
  const [sharpenPickerOpen, setSharpenPickerOpen] = useState(false);
  const [removalNotice, setRemovalNotice] = useState<PostResponseNotice | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const textRef = useRef<HTMLTextAreaElement>(null);
  const canAttachSharpen =
    user?.roles.some((role) => role === UserRole.Mentor || role === UserRole.Admin) ?? false;
  const mentionMatch = content.match(/(?:^|\s)@([a-z0-9_]*)$/i);
  const mentionQuery = mentionMatch?.[1] ?? "";
  const mentionSuggestions = useQuery({
    queryKey: ["mention-search", groupId ?? "global", mentionQuery],
    queryFn: async (): Promise<MentionSuggestion[]> => {
      const page = groupId
        ? await getGroupMembers(groupId, { search: mentionQuery, pageSize: 5 })
        : await searchUsers({ search: mentionQuery, pageSize: 5 });
      return page.items.map((item) => ({
        id: item.id,
        username: item.username,
        firstName: item.firstName,
        lastName: item.lastName,
        profilePictureUrl: item.profilePictureUrl,
      }));
    },
    enabled: mentionQuery.length >= 2,
    staleTime: 30_000,
  });

  const insertMention = (username: string) => {
    setContent((current) => current.replace(/(?:^|\s)@([a-z0-9_]*)$/i, (match) => {
      const prefix = match.startsWith(" ") ? " " : "";
      return `${prefix}@${username} `;
    }));
    textRef.current?.focus();
  };

  const mutation = useMutation({
    mutationFn: (data: PostCreate) => createPost(data),
    onSuccess: (post) => {
      if (post.moderationStatus === "removed") {
        setRemovalNotice({
          moderationReason: post.moderationReason,
          safetyIntervention: post.safetyIntervention ?? null,
        });
        return;
      }
      setContent("");
      setMediaUrl(null);
      setSharpenAttachment(null);
      setRemovalNotice(null);
      queryClient.invalidateQueries({ queryKey: ["feed"] });
      queryClient.invalidateQueries({ queryKey: ["group-posts", groupId] });
      onSuccess?.();
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const url = await uploadFile(file, "post");
      setMediaUrl(url);
      toast.success("Image uploaded");
    } catch {
      toast.error("Image upload failed");
    }
  };

  const handleSubmit = () => {
    if (!content.trim() && !mediaUrl && !sharpenAttachment) return;
    setRemovalNotice(null);
    const trimmedContent = content.trim();
    const payload: PostCreate = {};
    if (trimmedContent) payload.content = trimmedContent;
    if (mediaUrl) payload.mediaUrl = mediaUrl;
    if (sharpenAttachment) payload.sharpenReference = String(sharpenAttachment.moduleId);
    if (groupId !== undefined) payload.groupId = groupId;
    mutation.mutate(payload);
  };

  return (
    <Card className="mb-4">
      <CardContent className="pt-4">
        <div className="flex gap-3">
          <Avatar
            src={user?.profilePictureUrl}
            firstName={user?.firstName}
            lastName={user?.lastName}
            username={user?.username}
            size="md"
          />
          <div className="flex-1">
            <textarea
              ref={textRef}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What's on your mind?"
              rows={3}
              className="w-full resize-none rounded-lg border border-input bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring placeholder:text-muted-foreground"
            />
            {mediaUrl && (
              <p className="text-xs text-muted-foreground mt-1 truncate">
                &#128206; {mediaUrl}
              </p>
            )}
            {sharpenAttachment && (
              <SelectedSharpenAttachment
                item={sharpenAttachment}
                onRemove={() => setSharpenAttachment(null)}
              />
            )}
            {mentionSuggestions.data?.length ? (
              <div className="mt-2 rounded-md border bg-background p-1 shadow-sm">
                {mentionSuggestions.data
                  .filter((item) => item.id !== user?.id)
                  .map((item) => (
                    <Button
                      key={item.id}
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-auto w-full justify-start gap-2 px-2 py-1.5 text-left"
                      onClick={() => insertMention(item.username)}
                    >
                      <Avatar
                        src={item.profilePictureUrl}
                        firstName={item.firstName}
                        lastName={item.lastName}
                        username={item.username}
                        size="sm"
                      />
                      <span className="min-w-0 truncate">
                        {item.firstName} {item.lastName} @{item.username}
                      </span>
                    </Button>
                  ))}
              </div>
            ) : null}
            {removalNotice ? (
              <RemovalNotice notice={removalNotice} />
            ) : null}
            <div className="flex items-center justify-between mt-2">
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  disabled={uploading}
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  <ImagePlus className="h-5 w-5" />
                </Button>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageChange}
                />
                {canAttachSharpen && (
                  <Button
                    variant="ghost"
                    type="button"
                    onClick={() => setSharpenPickerOpen(true)}
                    className="gap-2 text-muted-foreground hover:text-primary transition-colors"
                  >
                    <Clapperboard className="h-5 w-5" />
                    Sharpen
                  </Button>
                )}
              </div>
              <Button
                size="sm"
                onClick={handleSubmit}
                disabled={
                  mutation.isPending ||
                  uploading ||
                  (!content.trim() && !mediaUrl && !sharpenAttachment)
                }
              >
                <Send className="h-4 w-4 mr-1" />
                Post
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
      <SharpenPicker
        open={sharpenPickerOpen}
        onClose={() => setSharpenPickerOpen(false)}
        onSelect={setSharpenAttachment}
      />
    </Card>
  );
}

type PostResponseNotice = {
  moderationReason: string | null;
  safetyIntervention?: Record<string, unknown> | null;
};

function RemovalNotice({ notice }: { notice: PostResponseNotice }) {
  const isSelfHarm = notice.moderationReason?.includes("self_harm_risk") ?? false;
  const intervention = notice.safetyIntervention;
  return (
    <div className="mt-3 rounded-md border bg-muted/50 p-3 text-sm">
      <p className="font-medium">
        {isSelfHarm
          ? "Your post was not shared. Support is available now."
          : "Your post was not shared and is under review."}
      </p>
      {intervention ? (
        <div className="mt-2 space-y-1 text-muted-foreground">
          <p className="font-medium text-foreground">
            {String(intervention.title ?? "Support")}
          </p>
          <p>{String(intervention.message ?? "")}</p>
        </div>
      ) : null}
    </div>
  );
}
