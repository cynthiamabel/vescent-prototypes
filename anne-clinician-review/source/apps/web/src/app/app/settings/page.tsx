"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import {
  apiRequest,
  changePassword,
  GRADE_OPTIONS,
  getUserSettings,
  listBlockedUsers,
  normalizeNotificationSettingsPatch,
  TIMEZONE_OPTIONS,
  unblockUser,
  updateUserSettings,
  US_STATE_OPTIONS,
  timezoneLabel,
  type UserProfile,
  type NotificationSettings,
  type UserProfileUpdate,
} from "@vescent/shared";
import { Pencil } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/use-auth";
import { useAuthStore } from "@/stores/auth-store";
import { useUpload } from "@/hooks/use-upload";
import { Avatar } from "@/components/ui/avatar";
import { AppearanceSelector } from "@/components/theme/appearance-selector";

export default function SettingsPage() {
  const { user, token } = useAuth();
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const { uploadFile, uploading } = useUpload();
  const fileRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();
  const [profileEditing, setProfileEditing] = useState(false);
  const { data: notificationSettings } = useQuery({
    queryKey: ["user-settings"],
    queryFn: getUserSettings,
  });
  const { data: blockedUsers = [] } = useQuery({
    queryKey: ["blocked-users"],
    queryFn: listBlockedUsers,
  });
  const { register, handleSubmit, reset } = useForm<UserProfileUpdate>({
    defaultValues: {
      firstName: user?.firstName ?? "",
      lastName: user?.lastName ?? "",
      state: user?.state ?? "",
      grade: user?.grade ?? 0,
      timezone: user?.timezone ?? "America/New_York",
    },
  });
  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    reset: resetPasswordForm,
  } = useForm<{
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  }>({
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  useEffect(() => {
    reset({
      firstName: user?.firstName ?? "",
      lastName: user?.lastName ?? "",
      state: user?.state ?? "",
      grade: user?.grade ?? 0,
      timezone: user?.timezone ?? "America/New_York",
    });
  }, [reset, user]);

  const mutation = useMutation({
    mutationFn: (data: UserProfileUpdate) =>
      apiRequest<UserProfile>("/api/v1/user-profiles/", {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    onSuccess: (profile) => {
      if (user && token) {
        setAuth(token, {
          ...user,
          firstName: profile.firstName,
          lastName: profile.lastName,
          state: profile.state,
          grade: profile.grade,
          timezone: profile.timezone,
          profilePictureUrl: profile.profilePictureUrl,
        });
      }
      reset({
        firstName: profile.firstName,
        lastName: profile.lastName,
        state: profile.state ?? "",
        grade: profile.grade,
        timezone: profile.timezone,
      });
      setProfileEditing(false);
      toast.success("Profile updated");
    },
    onError: (e: Error) => toast.error(e.message),
  });
  const settingsMutation = useMutation({
    mutationFn: updateUserSettings,
    onMutate: async (patch) => {
      await queryClient.cancelQueries({ queryKey: ["user-settings"] });
      const previous = queryClient.getQueryData<NotificationSettings>(["user-settings"]);
      const normalizedPatch = normalizeNotificationSettingsPatch(previous, patch);
      if (previous) queryClient.setQueryData(["user-settings"], { ...previous, ...normalizedPatch });
      return { previous };
    },
    onError: (_error, _patch, context) => {
      if (context?.previous) queryClient.setQueryData(["user-settings"], context.previous);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["user-settings"] }),
  });
  const passwordMutation = useMutation({
    mutationFn: async (data: {
      currentPassword: string;
      newPassword: string;
      confirmPassword: string;
    }) => {
      if (data.newPassword !== data.confirmPassword) {
        throw new Error("New passwords do not match.");
      }
      return changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
    },
    onSuccess: () => {
      resetPasswordForm();
      toast.success("Password changed");
    },
    onError: (e: Error) => toast.error(e.message),
  });
  const unblockMutation = useMutation({
    mutationFn: unblockUser,
    onSuccess: () => {
      toast.success("User unblocked");
      queryClient.invalidateQueries({ queryKey: ["blocked-users"] });
      queryClient.invalidateQueries({ queryKey: ["feed"] });
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const url = await uploadFile(file, "avatar");
      await mutation.mutateAsync({ profilePictureUrl: url });
      if (user && token) {
        setAuth(token, { ...user, profilePictureUrl: url });
      }
    } catch {
      toast.error("Avatar upload failed");
    }
  };

  return (
    <div className="max-w-lg space-y-6">
      <h1 className="text-2xl font-bold">Settings</h1>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-3">
          <CardTitle>Profile</CardTitle>
          <Button
            type="button"
            variant="ghost"
            size={profileEditing ? "sm" : "icon"}
            onClick={() => setProfileEditing((current) => !current)}
            aria-label={profileEditing ? "Cancel profile editing" : "Edit profile"}
          >
            {profileEditing ? "Cancel" : <Pencil className="h-4 w-4" />}
          </Button>
        </CardHeader>
        <CardContent>
          <div className="mb-6 flex items-center gap-4">
            <Avatar
              src={user?.profilePictureUrl}
              firstName={user?.firstName}
              lastName={user?.lastName}
              username={user?.username}
              size="lg"
              expandable
            />
            {profileEditing ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
              >
                {uploading ? "Uploading..." : "Change Photo"}
              </Button>
            ) : null}
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarChange}
            />
          </div>
          {profileEditing ? (
            <form
              onSubmit={handleSubmit((d) => mutation.mutate(d))}
              className="space-y-3"
            >
              <div className="grid gap-3 md:grid-cols-2">
                <LabeledControl label="First name">
                  <Input placeholder="First name" {...register("firstName")} />
                </LabeledControl>
                <LabeledControl label="Last name">
                  <Input placeholder="Last name" {...register("lastName")} />
                </LabeledControl>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <LabeledControl label="State">
                  <select
                    aria-label="State"
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                    {...register("state")}
                  >
                    <option value="">State</option>
                    {US_STATE_OPTIONS.map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </LabeledControl>
                <LabeledControl label="Grade">
                  <select
                    aria-label="Grade"
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                    {...register("grade", { valueAsNumber: true })}
                  >
                    {GRADE_OPTIONS.map((grade) => (
                      <option key={grade} value={grade}>Grade {grade}</option>
                    ))}
                  </select>
                </LabeledControl>
              </div>
              <LabeledControl label="Timezone">
                <select
                  aria-label="Timezone"
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                  {...register("timezone")}
                >
                  {TIMEZONE_OPTIONS.map((timezone) => (
                    <option key={timezone} value={timezone}>{timezoneLabel(timezone)}</option>
                  ))}
                </select>
              </LabeledControl>
              <Button type="submit" disabled={mutation.isPending}>
                Save Changes
              </Button>
            </form>
          ) : (
            <div className="grid gap-3 text-sm md:grid-cols-2">
              <ReadOnlyField label="First name" value={user?.firstName || "Not set"} />
              <ReadOnlyField label="Last name" value={user?.lastName || "Not set"} />
              <ReadOnlyField label="State" value={stateLabel(user?.state)} />
              <ReadOnlyField label="Grade" value={user?.grade ? `Grade ${user.grade}` : "Not set"} />
              <ReadOnlyField label="Timezone" value={timezoneLabel(user?.timezone ?? "America/New_York")} />
            </div>
          )}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
        </CardHeader>
        <CardContent>
          <AppearanceSelector />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Subscription</CardTitle>
        </CardHeader>
        <CardContent>
          <Button type="button" variant="outline" onClick={() => router.push("/app/settings/subscription")}>
            Update Subscription
          </Button>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Notifications</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {notificationSettings ? (
            <>
              <NotificationCheckbox
                label="All push notifications"
                checked={notificationSettings.notificationsEnabled}
                onChange={(checked) => settingsMutation.mutate({ notificationsEnabled: checked })}
              />
              <NotificationCheckbox
                label="Replies"
                checked={notificationSettings.notifyRepliesEnabled}
                onChange={(checked) => settingsMutation.mutate({ notifyRepliesEnabled: checked })}
              />
              <NotificationCheckbox
                label="Reactions"
                checked={notificationSettings.notifyReactionsEnabled}
                onChange={(checked) => settingsMutation.mutate({ notifyReactionsEnabled: checked })}
              />
              <NotificationCheckbox
                label="Messages"
                checked={notificationSettings.notifyMessagesEnabled}
                onChange={(checked) => settingsMutation.mutate({ notifyMessagesEnabled: checked })}
              />
              <NotificationCheckbox
                label="Meetings"
                checked={notificationSettings.notifyMeetingsEnabled}
                onChange={(checked) => settingsMutation.mutate({ notifyMeetingsEnabled: checked })}
              />
              <NotificationCheckbox
                label="Calls"
                checked={notificationSettings.notifyCallsEnabled}
                onChange={(checked) => settingsMutation.mutate({ notifyCallsEnabled: checked })}
              />
              <NotificationCheckbox
                label="Account updates"
                checked={notificationSettings.notifyAccountEnabled}
                onChange={(checked) => settingsMutation.mutate({ notifyAccountEnabled: checked })}
              />
              <NotificationCheckbox
                label="Return reminders"
                checked={notificationSettings.notifyNudgesEnabled}
                onChange={(checked) => settingsMutation.mutate({ notifyNudgesEnabled: checked })}
              />
            </>
          ) : (
            <p className="text-sm text-muted-foreground">Loading notification settings...</p>
          )}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Blocked Users</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {blockedUsers.length === 0 ? (
            <p className="text-sm text-muted-foreground">No blocked users.</p>
          ) : (
            blockedUsers.map((blocked) => (
              <div key={blocked.userId} className="flex items-center justify-between gap-3 rounded-md border px-3 py-2">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">
                    {blocked.firstName} {blocked.lastName}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">@{blocked.username}</p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={unblockMutation.isPending}
                  onClick={() => unblockMutation.mutate(blocked.userId)}
                >
                  Unblock
                </Button>
              </div>
            ))
          )}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Password</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={handlePasswordSubmit((data) => passwordMutation.mutate(data))}
            className="space-y-3"
          >
            <Input
              type="password"
              placeholder="Current password"
              {...registerPassword("currentPassword")}
            />
            <Input
              type="password"
              placeholder="New password"
              {...registerPassword("newPassword")}
            />
            <Input
              type="password"
              placeholder="Confirm new password"
              {...registerPassword("confirmPassword")}
            />
            <Button type="submit" disabled={passwordMutation.isPending}>
              Change Password
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

function NotificationCheckbox({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex items-center justify-between gap-3 rounded-md border px-3 py-2 text-sm">
      <span>{label}</span>
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="h-4 w-4"
      />
    </label>
  );
}

function LabeledControl({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="space-y-1 text-sm">
      <span className="block text-xs font-medium text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}

function ReadOnlyField({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border bg-muted/20 px-3 py-2">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className="mt-1 truncate text-sm">{value}</p>
    </div>
  );
}

function stateLabel(value: string | null | undefined) {
  if (!value) return "Not set";
  return US_STATE_OPTIONS.find(([state]) => state === value)?.[1] ?? value;
}
