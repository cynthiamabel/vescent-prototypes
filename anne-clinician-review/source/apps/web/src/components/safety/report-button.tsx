"use client";

import { useState } from "react";
import { Flag } from "lucide-react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { createSafetyReport, getSafetyReportReasons } from "@vescent/shared";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface ReportButtonProps {
  targetType: string;
  targetId: string;
  reportedUserId?: string | null;
  variant?: "ghost" | "outline";
}

export function ReportButton({
  targetType,
  targetId,
  reportedUserId,
  variant = "ghost",
}: ReportButtonProps) {
  const [open, setOpen] = useState(false);
  const [reasonCode, setReasonCode] = useState("other");
  const [note, setNote] = useState("");
  const { data: reasons = [] } = useQuery({
    queryKey: ["safety", "report-reasons"],
    queryFn: getSafetyReportReasons,
    enabled: open,
  });
  const mutation = useMutation({
    mutationFn: () =>
      createSafetyReport(
        reportedUserId === undefined
          ? {
              targetType,
              targetId,
              reasonCode,
              note: note.trim() || null,
            }
          : {
              targetType,
              targetId,
              reportedUserId,
              reasonCode,
              note: note.trim() || null,
            },
      ),
    onSuccess: () => {
      setOpen(false);
      setNote("");
      toast.success("Report submitted");
    },
    onError: (error: Error) => toast.error("Could not submit report", { description: error.message }),
  });

  if (!open) {
    return (
      <Button
        type="button"
        size="sm"
        variant={variant}
        className="gap-1.5 text-muted-foreground"
        onClick={() => setOpen(true)}
      >
        <Flag className="h-3.5 w-3.5" />
        Report
      </Button>
    );
  }

  return (
    <div className="mt-2 space-y-2 rounded-md border bg-background p-3">
      <select
        className="w-full rounded-md border bg-background px-2 py-1.5 text-sm"
        value={reasonCode}
        onChange={(event) => setReasonCode(event.target.value)}
      >
        {(reasons.length ? reasons : [{ code: "other", label: "Other safety concern" }]).map((reason) => (
          <option key={reason.code} value={reason.code}>
            {reason.label}
          </option>
        ))}
      </select>
      <textarea
        className="min-h-20 w-full rounded-md border bg-background px-2 py-1.5 text-sm"
        placeholder="Add context for the safety team"
        value={note}
        onChange={(event) => setNote(event.target.value)}
      />
      <div className="flex justify-end gap-2">
        <Button type="button" size="sm" variant="ghost" onClick={() => setOpen(false)}>
          Cancel
        </Button>
        <Button type="button" size="sm" onClick={() => mutation.mutate()} disabled={mutation.isPending}>
          Submit
        </Button>
      </div>
    </div>
  );
}
