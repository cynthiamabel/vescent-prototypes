"use client";

import { useEffect, useMemo, useState } from "react";
import { useInfiniteQuery, useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { CalendarClock, Plus, Users, Video, X } from "lucide-react";
import {
  approveMeetingRequestAsMentor,
  createGroupVideoRoom,
  denyMeetingRequestAsMentor,
  getGroup,
  proposeGroupMeeting,
  recordUsageEvent,
  UserRole,
  type GroupMeetingRequestResponse,
  type GroupMeetingSchedule,
} from "@vescent/shared";
import { toast } from "sonner";
import { PostCard } from "@/components/feed/post-card";
import { CreatePostForm } from "@/components/feed/create-post-form";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { getGroupPosts } from "@vescent/shared";
import { useAuth } from "@/hooks/use-auth";
import { InfiniteScrollSentinel } from "@/components/ui/infinite-scroll-sentinel";

const UTC_WEEKDAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

function utcWeekdayName(day: number) {
  return UTC_WEEKDAYS[day] ?? `day ${day}`;
}

function formatMeetingTime(weekdayUtc: number, startTimeUtc: string) {
  return `${utcWeekdayName(weekdayUtc)} at ${startTimeUtc} UTC`;
}

function nextMeetingSummary(schedules: GroupMeetingSchedule[]) {
  const firstSchedule = [...schedules].sort((a, b) => {
    if (a.weekdayUtc !== b.weekdayUtc) {
      return a.weekdayUtc - b.weekdayUtc;
    }
    return a.startTimeUtc.localeCompare(b.startTimeUtc);
  })[0];

  if (!firstSchedule) {
    return null;
  }

  return formatMeetingTime(firstSchedule.weekdayUtc, firstSchedule.startTimeUtc);
}

export default function GroupDetailPage() {
  const { id } = useParams<{ id: string }>();
  const groupId = Number(id);
  const router = useRouter();
  const qc = useQueryClient();
  const { user } = useAuth();
  const [meetingLabel, setMeetingLabel] = useState("");
  const [weekdayUtc, setWeekdayUtc] = useState("0");
  const [startTimeUtc, setStartTimeUtc] = useState("17:00");
  const [durationMinutes, setDurationMinutes] = useState("60");
  const [isMeetingModalOpen, setIsMeetingModalOpen] = useState(false);
  const [isNewMeetingVisible, setIsNewMeetingVisible] = useState(false);

  const { data: group, isLoading } = useQuery({
    queryKey: ["group", groupId],
    queryFn: () => getGroup(groupId),
  });

  const {
    data: postPages,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  } = useInfiniteQuery({
    queryKey: ["group-posts", groupId],
    queryFn: ({ pageParam }) =>
      getGroupPosts(groupId, { page: pageParam, pageSize: 20 }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.hasNextPage ? lastPage.page + 1 : undefined,
    enabled: !!group?.isMember,
  });
  const posts = postPages?.pages.flatMap((page) => page.items) ?? [];

  const videoMutation = useMutation({
    mutationFn: () => createGroupVideoRoom(groupId),
    onSuccess: (room) => router.push(`/app/video/${room.id}`),
  });
  const meetingMutation = useMutation({
    mutationFn: () => {
      const trimmedLabel = meetingLabel.trim();
      return proposeGroupMeeting(groupId, {
        ...(trimmedLabel ? { label: trimmedLabel } : {}),
        recurrence: "weekly",
        weekdayUtc: Number(weekdayUtc),
        startTimeUtc,
        durationMinutes: Number(durationMinutes),
      });
    },
    onSuccess: (request) => {
      toast.success(
        request.status === "approved"
          ? "Meeting time configured"
          : "Meeting time sent for approval",
      );
      setMeetingLabel("");
      setIsNewMeetingVisible(false);
      qc.invalidateQueries({ queryKey: ["group", groupId] });
    },
    onError: (error: Error) => {
      toast.error(`Could not configure meeting: ${error.message}`);
    },
  });
  const approveMeetingMutation = useMutation({
    mutationFn: approveMeetingRequestAsMentor,
    onSuccess: (request) => {
      toast.success(request.status === "approved" ? "Meeting time approved" : "Approval recorded");
      qc.invalidateQueries({ queryKey: ["group", groupId] });
    },
    onError: (error: Error) => {
      toast.error(`Could not approve meeting: ${error.message}`);
    },
  });
  const denyMeetingMutation = useMutation({
    mutationFn: denyMeetingRequestAsMentor,
    onSuccess: () => {
      toast.success("Meeting time declined");
      qc.invalidateQueries({ queryKey: ["group", groupId] });
    },
    onError: (error: Error) => {
      toast.error(`Could not decline meeting: ${error.message}`);
    },
  });

  const pendingMeetingRequests = group?.pendingMeetingRequests ?? [];
  const meetingSchedules = group?.meetingSchedules ?? [];
  const approvalRequests = useMemo(
    () =>
      pendingMeetingRequests.filter((request) =>
        request.approvals.some(
          (approval) =>
            approval.mentorUserId === user?.id && approval.status === "pending",
        ),
      ),
    [pendingMeetingRequests, user?.id],
  );
  const ownPendingRequests = useMemo(
    () =>
      pendingMeetingRequests.filter(
        (request) =>
          request.proposedByUserId === user?.id &&
          !approvalRequests.some((approvalRequest) => approvalRequest.id === request.id),
      ),
    [approvalRequests, pendingMeetingRequests, user?.id],
  );
  const nextMeeting = nextMeetingSummary(meetingSchedules);

  useEffect(() => {
    if (!Number.isFinite(groupId)) return;
    void recordUsageEvent({
      eventType: "group_viewed",
      source: "client",
      targetType: "group",
      targetId: String(groupId),
      groupId,
    });
  }, [groupId]);

  if (isLoading) return <Skeleton className="h-64 w-full" />;
  if (!group)
    return <p className="text-center text-muted-foreground">Group not found</p>;
  const isGeneralGroup = group.groupType === "general";
  const mentorNames = group.mentorLeaders
    .map((mentor) => `${mentor.firstName} ${mentor.lastName}`)
    .join(", ");
  const canJoinVideo = !isGeneralGroup && group.meetingSchedules.some((schedule) => schedule.isVideoAvailable);
  const canConfigureMeetings = Boolean(!isGeneralGroup && user?.roles.includes(UserRole.Mentor));
  const isResolvingMeeting =
    approveMeetingMutation.isPending || denyMeetingMutation.isPending;

  return (
    <div>
      {/* Header */}
      <div className="flex items-start gap-4 mb-6">
        <Avatar src={group.pictureUrl} username={group.name} size="lg" expandable />
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{group.name}</h1>
          <Button
            type="button"
            variant="ghost"
            className="mt-1 h-auto justify-start gap-1 p-0 text-sm text-muted-foreground hover:bg-transparent hover:text-primary"
            onClick={() => router.push(`/app/groups/${group.id}/members`)}
          >
            <Users className="h-3.5 w-3.5" />
            {group.groupType === "direct_mentor"
              ? "Private Group"
              : `${group.memberCount} members`}
          </Button>
          {!isGeneralGroup && (
            <p className="text-sm mt-1 text-muted-foreground">
              {mentorNames ? `Mentors: ${mentorNames}` : "Mentor circle"}
            </p>
          )}
        </div>
        <div className="flex gap-2">
          {group.isMember && !isGeneralGroup && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => videoMutation.mutate()}
              disabled={videoMutation.isPending || !canJoinVideo}
            >
              <Video className="h-4 w-4 mr-1" />
              {videoMutation.isPending ? "Opening..." : "Join video"}
            </Button>
          )}
        </div>
      </div>

      {!isGeneralGroup && (
        <MeetingSummaryBar
          nextMeeting={nextMeeting}
          pendingApprovalCount={approvalRequests.length}
          onOpen={() => setIsMeetingModalOpen(true)}
        />
      )}

      {/* Posts */}
      {group.isMember ? (
        <>
          <CreatePostForm groupId={groupId} />
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
          <InfiniteScrollSentinel
            hasNextPage={Boolean(hasNextPage)}
            isFetchingNextPage={isFetchingNextPage}
            onLoadMore={() => void fetchNextPage()}
          />
        </>
      ) : (
        <p className="text-center text-muted-foreground py-12">
          This circle is still being provisioned.
        </p>
      )}
      {!isGeneralGroup && (
        <MeetingScheduleModal
          isOpen={isMeetingModalOpen}
          onClose={() => setIsMeetingModalOpen(false)}
          activeSchedules={group.meetingSchedules}
          approvalRequests={approvalRequests}
          ownPendingRequests={ownPendingRequests}
          currentUserId={user?.id}
          canCreate={group.isMember && canConfigureMeetings}
          isResolvingMeeting={isResolvingMeeting}
          isCreatingMeeting={meetingMutation.isPending}
          isNewMeetingVisible={isNewMeetingVisible}
          onToggleNewMeeting={() => setIsNewMeetingVisible((visible) => !visible)}
          meetingLabel={meetingLabel}
          weekdayUtc={weekdayUtc}
          startTimeUtc={startTimeUtc}
          durationMinutes={durationMinutes}
          onMeetingLabelChange={setMeetingLabel}
          onWeekdayUtcChange={setWeekdayUtc}
          onStartTimeUtcChange={setStartTimeUtc}
          onDurationMinutesChange={setDurationMinutes}
          onCreateMeeting={() => meetingMutation.mutate()}
          onApproveMeeting={(requestId) => approveMeetingMutation.mutate(requestId)}
          onDenyMeeting={(requestId) => denyMeetingMutation.mutate(requestId)}
        />
      )}
    </div>
  );
}

interface MeetingSummaryBarProps {
  nextMeeting: string | null;
  pendingApprovalCount: number;
  onOpen: () => void;
}

function MeetingSummaryBar({
  nextMeeting,
  pendingApprovalCount,
  onOpen,
}: MeetingSummaryBarProps) {
  return (
    <Button
      type="button"
      onClick={onOpen}
      variant="outline"
      className="mb-6 h-auto w-full justify-start gap-3 bg-muted/20 p-3 text-left hover:bg-muted/30"
    >
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border bg-background">
        <CalendarClock className="h-4 w-4 text-muted-foreground" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-semibold">
          {nextMeeting ? `Next meeting: ${nextMeeting}` : "No meetings scheduled"}
        </span>
        <span className="mt-0.5 block text-xs text-muted-foreground">
          {nextMeeting ? "View meeting schedule" : "View and schedule meetings"}
        </span>
      </span>
      {pendingApprovalCount > 0 && (
        <span className="rounded-full bg-primary px-2 py-1 text-xs font-medium text-primary-foreground">
          {pendingApprovalCount}
        </span>
      )}
    </Button>
  );
}

interface MeetingScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeSchedules: GroupMeetingSchedule[];
  approvalRequests: GroupMeetingRequestResponse[];
  ownPendingRequests: GroupMeetingRequestResponse[];
  currentUserId: string | undefined;
  canCreate: boolean;
  isResolvingMeeting: boolean;
  isCreatingMeeting: boolean;
  isNewMeetingVisible: boolean;
  onToggleNewMeeting: () => void;
  meetingLabel: string;
  weekdayUtc: string;
  startTimeUtc: string;
  durationMinutes: string;
  onMeetingLabelChange: (value: string) => void;
  onWeekdayUtcChange: (value: string) => void;
  onStartTimeUtcChange: (value: string) => void;
  onDurationMinutesChange: (value: string) => void;
  onCreateMeeting: () => void;
  onApproveMeeting: (requestId: number) => void;
  onDenyMeeting: (requestId: number) => void;
}

function MeetingScheduleModal({
  isOpen,
  onClose,
  activeSchedules,
  approvalRequests,
  ownPendingRequests,
  currentUserId,
  canCreate,
  isResolvingMeeting,
  isCreatingMeeting,
  isNewMeetingVisible,
  onToggleNewMeeting,
  meetingLabel,
  weekdayUtc,
  startTimeUtc,
  durationMinutes,
  onMeetingLabelChange,
  onWeekdayUtcChange,
  onStartTimeUtcChange,
  onDurationMinutesChange,
  onCreateMeeting,
  onApproveMeeting,
  onDenyMeeting,
}: MeetingScheduleModalProps) {
  if (!isOpen) {
    return null;
  }

  const isCreateDisabled =
    isCreatingMeeting ||
    Number.isNaN(Number(weekdayUtc)) ||
    Number(weekdayUtc) < 0 ||
    Number(weekdayUtc) > 6 ||
    !startTimeUtc ||
    Number.isNaN(Number(durationMinutes)) ||
    Number(durationMinutes) < 15 ||
    Number(durationMinutes) > 240;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 px-3 pb-3 pt-12 sm:items-center sm:p-6">
      <Button
        type="button"
        variant="ghost"
        aria-label="Close meeting schedule"
        className="absolute inset-0 h-auto w-auto cursor-default rounded-none p-0 hover:bg-transparent"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Meeting schedule"
        className="relative flex max-h-[82vh] w-full max-w-2xl flex-col overflow-hidden rounded-xl border bg-background shadow-xl"
      >
        <div className="flex items-center justify-between gap-3 border-b px-4 py-3">
          <div>
            <h2 className="text-base font-semibold">Meeting schedule</h2>
            <p className="text-xs text-muted-foreground">
              {activeSchedules.length} active · {ownPendingRequests.length} requested
            </p>
          </div>
          <Button type="button" variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex-1 space-y-5 overflow-y-auto px-4 py-4">
          {approvalRequests.length > 0 && (
            <MeetingSection title="Needs your approval">
              <div className="space-y-2">
                {approvalRequests.map((request) => (
                  <PendingMeetingRequest
                    key={request.id}
                    request={request}
                    currentUserId={currentUserId}
                    isBusy={isResolvingMeeting}
                    onApprove={() => onApproveMeeting(request.id)}
                    onDeny={() => onDenyMeeting(request.id)}
                  />
                ))}
              </div>
            </MeetingSection>
          )}

          <MeetingSection title="Active meetings">
            {activeSchedules.length ? (
              <div className="space-y-2">
                {activeSchedules.map((schedule) => (
                  <ActiveMeetingRow key={schedule.id} schedule={schedule} />
                ))}
              </div>
            ) : (
              <p className="rounded-md border border-dashed px-3 py-4 text-sm text-muted-foreground">
                No approved meeting times yet.
              </p>
            )}
          </MeetingSection>

          {ownPendingRequests.length > 0 && (
            <MeetingSection title="Your requests">
              <div className="space-y-2">
                {ownPendingRequests.map((request) => (
                  <OwnPendingMeetingRow key={request.id} request={request} />
                ))}
              </div>
            </MeetingSection>
          )}

          {canCreate && (
            <div className="border-t pt-4">
              <Button
                type="button"
                variant={isNewMeetingVisible ? "secondary" : "default"}
                onClick={onToggleNewMeeting}
              >
                <Plus className="mr-2 h-4 w-4" />
                New meeting
              </Button>
              {isNewMeetingVisible && (
                <div className="mt-4 grid gap-3 md:grid-cols-[1fr_120px_150px_130px]">
                  <label className="space-y-1">
                    <span className="text-xs font-medium text-muted-foreground">
                      Meeting label
                    </span>
                    <Input
                      placeholder="Office hours"
                      value={meetingLabel}
                      onChange={(event) => onMeetingLabelChange(event.target.value)}
                    />
                  </label>
                  <label className="space-y-1">
                    <span className="text-xs font-medium text-muted-foreground">
                      UTC weekday
                    </span>
                    <Input
                      type="number"
                      min={0}
                      max={6}
                      value={weekdayUtc}
                      onChange={(event) => onWeekdayUtcChange(event.target.value)}
                      aria-label="UTC weekday, 0 Monday through 6 Sunday"
                    />
                  </label>
                  <label className="space-y-1">
                    <span className="text-xs font-medium text-muted-foreground">
                      UTC start
                    </span>
                    <Input
                      type="time"
                      value={startTimeUtc}
                      onChange={(event) => onStartTimeUtcChange(event.target.value)}
                      aria-label="UTC start time"
                    />
                  </label>
                  <label className="space-y-1">
                    <span className="text-xs font-medium text-muted-foreground">
                      Minutes
                    </span>
                    <Input
                      type="number"
                      min={15}
                      max={240}
                      value={durationMinutes}
                      onChange={(event) => onDurationMinutesChange(event.target.value)}
                      aria-label="Duration minutes"
                    />
                  </label>
                  <div className="md:col-span-4">
                    <Button
                      type="button"
                      onClick={onCreateMeeting}
                      disabled={isCreateDisabled}
                    >
                      {isCreatingMeeting ? "Saving..." : "Request meeting"}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

interface MeetingSectionProps {
  title: string;
  children: React.ReactNode;
}

function MeetingSection({ title, children }: MeetingSectionProps) {
  return (
    <section>
      <h3 className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {title}
      </h3>
      {children}
    </section>
  );
}

interface ActiveMeetingRowProps {
  schedule: GroupMeetingSchedule;
}

function ActiveMeetingRow({ schedule }: ActiveMeetingRowProps) {
  return (
    <div className="rounded-md border bg-background px-3 py-3">
      <p className="text-sm font-medium">{schedule.label || "Weekly meeting"}</p>
      <p className="mt-1 text-xs text-muted-foreground">
        {schedule.recurrence} · {formatMeetingTime(schedule.weekdayUtc, schedule.startTimeUtc)} ·{" "}
        {schedule.durationMinutes} min
      </p>
    </div>
  );
}

interface OwnPendingMeetingRowProps {
  request: GroupMeetingRequestResponse;
}

function OwnPendingMeetingRow({ request }: OwnPendingMeetingRowProps) {
  const approvedCount = request.approvals.filter(
    (approval) => approval.status === "approved",
  ).length;

  return (
    <div className="rounded-md border bg-muted/30 px-3 py-3 opacity-75">
      <p className="text-sm font-medium">{request.label?.trim() || "Weekly meeting"}</p>
      <p className="mt-1 text-xs text-muted-foreground">
        {request.recurrence} · {formatMeetingTime(request.weekdayUtc, request.startTimeUtc)} ·{" "}
        {request.durationMinutes} min
      </p>
      <p className="mt-2 text-xs text-muted-foreground">
        {approvedCount}/{request.approvals.length} mentor approvals
        {request.requiresAdminApproval ? " · admin approval required" : ""}
      </p>
    </div>
  );
}

interface PendingMeetingRequestProps {
  request: GroupMeetingRequestResponse;
  currentUserId: string | undefined;
  isBusy: boolean;
  onApprove: () => void;
  onDeny: () => void;
}

function PendingMeetingRequest({
  request,
  currentUserId,
  isBusy,
  onApprove,
  onDeny,
}: PendingMeetingRequestProps) {
  const currentApproval = request.approvals.find(
    (approval) => approval.mentorUserId === currentUserId,
  );
  const isAwaitingCurrentMentor = currentApproval?.status === "pending";
  const approvedCount = request.approvals.filter(
    (approval) => approval.status === "approved",
  ).length;
  const label = request.label?.trim() || "Weekly meeting";

  return (
    <div className="rounded-md border bg-background p-3">
      <p className="font-medium">{label}</p>
      <p className="mt-1 text-sm text-muted-foreground">
        {request.recurrence} · {utcWeekdayName(request.weekdayUtc)} · {request.startTimeUtc} UTC ·{" "}
        {request.durationMinutes} min
      </p>
      <p className="mt-2 text-xs text-muted-foreground">
        {approvedCount}/{request.approvals.length} mentor approvals
        {request.requiresAdminApproval ? " · admin approval required" : ""}
      </p>
      {isAwaitingCurrentMentor ? (
        <div className="mt-3 flex gap-2">
          <Button size="sm" onClick={onApprove} disabled={isBusy}>
            Approve
          </Button>
          <Button size="sm" variant="destructive" onClick={onDeny} disabled={isBusy}>
            Deny
          </Button>
        </div>
      ) : (
        <p className="mt-3 text-xs text-muted-foreground">
          {request.proposedByUserId === currentUserId
            ? "Waiting on the other mentors."
            : "No approval is pending for this account."}
        </p>
      )}
    </div>
  );
}
