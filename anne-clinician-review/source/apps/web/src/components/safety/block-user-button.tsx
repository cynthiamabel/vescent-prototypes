"use client";

import { Ban } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { blockUser } from "@vescent/shared";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface BlockUserButtonProps {
  userId?: string | null;
  variant?: "ghost" | "outline";
}

export function BlockUserButton({ userId, variant = "ghost" }: BlockUserButtonProps) {
  const qc = useQueryClient();
  const mutation = useMutation({
    mutationFn: () => blockUser({ blockedUserId: userId!, reasonCode: "user_blocked" }),
    onSuccess: () => {
      toast.success("User blocked");
      qc.invalidateQueries({ queryKey: ["feed"] });
      qc.invalidateQueries({ queryKey: ["group-posts"] });
      qc.invalidateQueries({ queryKey: ["conversations"] });
      qc.invalidateQueries({ queryKey: ["blocked-users"] });
    },
    onError: (error: Error) => toast.error("Could not block user", { description: error.message }),
  });

  if (!userId) return null;

  return (
    <Button
      type="button"
      size="sm"
      variant={variant}
      className="gap-1.5 text-muted-foreground"
      onClick={() => {
        if (window.confirm("Block this user? Their content and conversations will be hidden.")) {
          mutation.mutate();
        }
      }}
      disabled={mutation.isPending}
    >
      <Ban className="h-3.5 w-3.5" />
      Block
    </Button>
  );
}
