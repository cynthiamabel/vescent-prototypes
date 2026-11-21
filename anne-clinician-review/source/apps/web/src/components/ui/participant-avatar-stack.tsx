import type { ConversationParticipant } from "@vescent/shared";
import { Avatar } from "./avatar";

export function ParticipantAvatarStack({
  participants,
  limit = 2,
}: {
  participants: ConversationParticipant[];
  limit?: number;
}) {
  const shown = participants.slice(0, limit);
  const overflow = participants.length - shown.length;
  return (
    <div className="flex -space-x-2.5 shrink-0">
      {overflow > 0 && (
        <div className="h-7 w-7 rounded-full bg-muted border-2 border-background flex items-center justify-center text-[10px] font-semibold text-muted-foreground z-10">
          +{overflow}
        </div>
      )}
      {[...shown].reverse().map((participant, index) => (
        <div key={participant.id} style={{ zIndex: shown.length - index }}>
          <Avatar
            src={participant.profilePictureUrl}
            username={participant.username}
            firstName={participant.firstName}
            lastName={participant.lastName}
            size="xs"
            className="border-2 border-background"
          />
        </div>
      ))}
    </div>
  );
}
