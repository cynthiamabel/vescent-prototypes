"use client";

import { useRouter } from "next/navigation";
import { Users } from "lucide-react";
import type { GroupResponse } from "@vescent/shared";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";

interface GroupCardProps {
  group: GroupResponse;
}

export function GroupCard({ group }: GroupCardProps) {
  const router = useRouter();
  const mentorNames = group.mentorLeaders
    .map((mentor) => `${mentor.firstName} ${mentor.lastName.charAt(0)}.`)
    .join(" & ");
  const isDirect = group.groupType === "direct_mentor";

  return (
    <Card
      className="cursor-pointer hover:shadow-md transition-shadow"
      onClick={() => router.push(`/app/groups/${group.id}`)}
    >
      <CardContent className="pt-4">
        <div className="flex items-start gap-3">
          <Avatar src={group.pictureUrl} username={group.name} size="md" expandable />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="font-semibold text-sm truncate">
                {group.name}
              </span>
              <Badge variant="secondary" className="text-xs">
                {isDirect ? "Private Group" : `${group.memberCount} Members`}
              </Badge>
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
              <Users className="h-3 w-3" />
              <span>{mentorNames || "Mentor circle"}</span>
            </div>
            <p className="text-xs text-muted-foreground line-clamp-2">
              {isDirect
                ? "Your private 1:1 space with your mentor."
                : "Your shared mentor circle."}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
