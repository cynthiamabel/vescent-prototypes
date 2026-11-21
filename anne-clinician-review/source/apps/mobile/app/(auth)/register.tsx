import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Linking,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Link, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as WebBrowser from "expo-web-browser";
import { Asset } from "expo-asset";
import * as FileSystem from "expo-file-system/legacy";
import {
  createRegistrationCheckout,
  GRADE_OPTIONS,
  onboardingProfileSchema,
  TIMEZONE_OPTIONS,
  US_STATE_OPTIONS,
  timezoneLabel,
  UserTier,
  type OnboardingProfileData,
} from "@vescent/shared";
import { ArrowLeft, Check, X } from "lucide-react-native";
import { Input } from "@/components/ui/Input";
import { PressableSurface } from "@/components/ui/PressableSurface";
import { TopBarButton } from "@/components/ui/TopBarButton";
import { useAppTheme } from "@/design/theme";
import { requestDeclaredAgeRange } from "@/lib/age-assurance";
import Toast from "react-native-toast-message";

type Step = "tier" | "profile" | "done" | "blocked";
type PolicyDocument = "terms" | "privacy";

const FREE_BULLETS = ["General Circle feed", "Profile settings", "Upgrade path coming soon"];
const BASIC_BULLETS = ["Shared mentor circle", "Weekly community guidance", "Core reflection tools"];
const PREMIUM_BULLETS = ["Everything in Basic", "Private 1:1 mentor circle", "Priority mentor matching"];
const STRIPE_REGISTRATION_RETURN_URL = "vescent://stripe-registration-return";
const US_STATES = US_STATE_OPTIONS;
const GRADES = GRADE_OPTIONS;
const TIMEZONES = TIMEZONE_OPTIONS;
const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

function formatDateLabel(value: string) {
  if (!value) return "Select birthdate";
  const [year, month, day] = value.split("-");
  if (!year || !month || !day) return "Select birthdate";
  return `${Number(month)}/${Number(day)}/${year}`;
}

function daysInMonth(year: number, monthIndex: number) {
  return new Date(year, monthIndex + 1, 0).getDate();
}

function dateString(year: number, monthIndex: number, day: number) {
  return `${year}-${String(monthIndex + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function stepTitle(step: Step) {
  if (step === "profile") return "Tell us about yourself";
  if (step === "tier") return "Select your experience";
  if (step === "blocked") return "Registration review";
  return "Registration complete";
}

function dismissStripeBrowser() {
  try {
    WebBrowser.dismissAuthSession();
  } catch {
    // Older clients may not have the auth-session native dismiss.
  }
  void WebBrowser.dismissBrowser().catch(() => undefined);
}

function checkoutSessionIdFromUrl(url: string) {
  try {
    return new URL(url).searchParams.get("session_id");
  } catch {
    return null;
  }
}

export default function RegisterScreen() {
  const { theme } = useAppTheme();
  const router = useRouter();
  const [step, setStep] = useState<Step>("profile");
  const [tier, setTier] = useState<UserTier | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [policyOpen, setPolicyOpen] = useState<PolicyDocument | null>(null);
  const [blockedMessage, setBlockedMessage] = useState("Your registration is awaiting admin review. We will email you when it is cleared.");
  const [profile, setProfile] = useState<OnboardingProfileData>({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
    birthdate: "",
    state: "",
    grade: 9,
    phone: "",
    timezone: TIMEZONES.includes(Intl.DateTimeFormat().resolvedOptions().timeZone as (typeof TIMEZONES)[number])
      ? Intl.DateTimeFormat().resolvedOptions().timeZone
      : "America/New_York",
    acceptedTerms: false,
    acceptedPrivacy: false,
  });
  const [errors, setErrors] = useState<Partial<Record<keyof OnboardingProfileData, string>>>({});
  const goBack = () => {
    if (step === "profile") {
      if (router.canGoBack()) {
        router.back();
      } else {
        router.replace("/(auth)/login");
      }
      return;
    }
    if (step === "tier") {
      setStep("profile");
      return;
    }
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/(auth)/login");
    }
  };

  const updateField = <K extends keyof OnboardingProfileData>(field: K, value: OnboardingProfileData[K]) => {
    setProfile((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  };

  const submitProfile = async () => {
    const nextProfile = {
      ...profile,
      username: profile.username.trim().toLowerCase(),
      email: profile.email.trim().toLowerCase(),
      firstName: profile.firstName.trim(),
      lastName: profile.lastName.trim(),
      phone: profile.phone.trim(),
    };
    const parsed = onboardingProfileSchema.safeParse(nextProfile);
    if (!parsed.success) {
      const nextErrors: Partial<Record<keyof OnboardingProfileData, string>> = {};
      for (const [field, messages] of Object.entries(parsed.error.flatten().fieldErrors)) {
        if (messages?.[0]) nextErrors[field as keyof OnboardingProfileData] = messages[0];
      }
      setErrors(nextErrors);
      return;
    }
    setProfile(parsed.data);
    setStep("tier");
  };

  const submitTier = async () => {
    if (!tier) {
      setStep("tier");
      return;
    }
    setSubmitting(true);
    try {
      const ageAssurance = await requestDeclaredAgeRange();
      const response = await createRegistrationCheckout({
        returnContext: "mobile",
        profile: {
          username: profile.username,
          email: profile.email,
          password: profile.password,
          firstName: profile.firstName,
          lastName: profile.lastName,
          birthdate: profile.birthdate,
          state: profile.state,
          grade: Number(profile.grade),
          phone: profile.phone,
          timezone: profile.timezone,
          userTier: tier,
          ageAssurance,
        },
      });
      if (response.checkoutUrl) {
        let handledStripeReturn = false;
        const handleStripeReturn = (url: string) => {
          handledStripeReturn = true;
          dismissStripeBrowser();
          const sessionId = checkoutSessionIdFromUrl(url);
          router.replace({
            pathname: "/stripe-registration-return",
            params: sessionId ? { session_id: sessionId } : undefined,
          });
        };
        const subscription = Linking.addEventListener("url", ({ url }) => {
          if (url.startsWith(STRIPE_REGISTRATION_RETURN_URL)) {
            handleStripeReturn(url);
          }
        });
        try {
          const result = await WebBrowser.openBrowserAsync(response.checkoutUrl, {
            presentationStyle: WebBrowser.WebBrowserPresentationStyle.FORM_SHEET,
          });
          if (!handledStripeReturn && (result.type === "cancel" || result.type === "dismiss")) {
            Toast.show({
              type: "info",
              text1: "Checkout not completed",
              text2: "Your subscription was not confirmed.",
            });
          }
        } finally {
          subscription.remove();
        }
        return;
      }
      setStep("done");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Could not complete registration";
      if (message.toLowerCase().includes("blocked")) {
        setBlockedMessage(message);
        setStep("blocked");
        return;
      }
      Toast.show({
        type: "error",
        text1: "Registration failed",
        text2: message,
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} className="flex-1 bg-app-bg">
      <View className="flex-row items-center gap-3 px-4 pt-14 pb-3 border-b border-border">
        <TopBarButton
          icon={ArrowLeft}
          variant="neutral"
          accessibilityLabel="Go back"
          onPress={goBack}
          disabled={submitting}
        />
        <Text className="font-heading text-foreground text-base">
          {stepTitle(step)}
        </Text>
      </View>
      <ScrollView className="flex-1" contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
        <View className="flex-1 px-6 py-8">
          {step === "profile" ? (
            <View className="gap-4">
              <Text className="font-heading text-3xl text-foreground">Tell us about yourself</Text>
              <Input label="Username" value={profile.username} onChangeText={(text) => updateField("username", text.toLowerCase())} autoCapitalize="none" autoCorrect={false} error={errors.username} />
              <Input label="Email" value={profile.email} onChangeText={(text) => updateField("email", text.toLowerCase())} autoCapitalize="none" autoCorrect={false} keyboardType="email-address" error={errors.email} />
              <Input label="Password" value={profile.password} onChangeText={(text) => updateField("password", text)} secureToggle error={errors.password} />
              <Input label="Confirm password" value={profile.confirmPassword} onChangeText={(text) => updateField("confirmPassword", text)} secureToggle error={errors.confirmPassword} />
              <Input label="First name" value={profile.firstName} onChangeText={(text) => updateField("firstName", text)} autoCapitalize="words" error={errors.firstName} />
              <Input label="Last name" value={profile.lastName} onChangeText={(text) => updateField("lastName", text)} autoCapitalize="words" error={errors.lastName} />
              <CalendarField label="Birthdate" value={profile.birthdate} error={errors.birthdate} onChange={(value) => updateField("birthdate", value)} />
              <SelectionField label="State" value={profile.state} options={US_STATES.map(([value, label]) => ({ value, label }))} error={errors.state} onChange={(value) => updateField("state", value)} />
              <SelectionField label="Grade" value={String(profile.grade)} options={GRADES.map((grade) => ({ value: String(grade), label: String(grade) }))} error={errors.grade} onChange={(value) => updateField("grade", Number(value))} />
              <Input label="Phone" value={profile.phone} onChangeText={(text) => updateField("phone", text)} keyboardType="phone-pad" error={errors.phone} />
              <SelectionField label="Timezone" value={profile.timezone} options={TIMEZONES.map((timezone) => ({ value: timezone, label: timezoneLabel(timezone) }))} error={errors.timezone} onChange={(value) => updateField("timezone", value)} />
              <LegalAcceptance
                acceptedTerms={profile.acceptedTerms}
                acceptedPrivacy={profile.acceptedPrivacy}
                termsError={errors.acceptedTerms}
                privacyError={errors.acceptedPrivacy}
                onToggleTerms={() => updateField("acceptedTerms", !profile.acceptedTerms)}
                onTogglePrivacy={() => updateField("acceptedPrivacy", !profile.acceptedPrivacy)}
                onOpenPolicy={setPolicyOpen}
              />
              <PrimaryButton label="Continue" loading={submitting} onPress={submitProfile} color={theme.primaryForeground} />
            </View>
          ) : null}

          {step === "tier" ? (
            <View className="gap-4">
              <Text className="font-heading text-3xl text-foreground">Select your experience</Text>
              <TierCard title="Free" price="$0" bullets={FREE_BULLETS} selected={tier === UserTier.Free} onPress={() => setTier(UserTier.Free)} />
              <TierCard title="Basic" price="$10" bullets={BASIC_BULLETS} selected={tier === UserTier.Basic} onPress={() => setTier(UserTier.Basic)} />
              <TierCard title="Premium" price="$30" bullets={PREMIUM_BULLETS} selected={tier === UserTier.Premium} onPress={() => setTier(UserTier.Premium)} />
              <PrimaryButton
                label={tier === UserTier.Free ? "Create account" : "Continue to Stripe"}
                loading={submitting}
                disabled={!tier}
                onPress={submitTier}
                color={theme.primaryForeground}
              />
            </View>
          ) : null}

          {step === "done" ? (
            <View className="gap-5">
              <Text className="font-heading text-3xl text-foreground">Check your email</Text>
              <Text className="font-sans text-muted-foreground leading-6">Verify your account, then sign in to finish mentor matching.</Text>
              <PrimaryButton label="Back to sign in" loading={false} onPress={goBack} color={theme.primaryForeground} />
            </View>
          ) : null}

          {step === "blocked" ? (
            <View className="gap-5">
              <Text className="font-heading text-3xl text-foreground">Registration blocked</Text>
              <Text className="font-sans text-muted-foreground leading-6">{blockedMessage}</Text>
              <Text className="font-sans text-muted-foreground leading-6">An admin needs to review this before the email can register.</Text>
              <PrimaryButton label="Back to sign in" loading={false} onPress={goBack} color={theme.primaryForeground} />
            </View>
          ) : null}

          {step !== "done" && step !== "blocked" ? (
            <View className="flex-row justify-center mt-6">
              <Text className="font-sans text-muted-foreground">Already have an account? </Text>
              <Link href="/(auth)/login" asChild>
                <PressableSurface>
                  <Text className="font-sans text-brand font-semibold">Sign in</Text>
                </PressableSurface>
              </Link>
            </View>
          ) : null}
        </View>
      </ScrollView>
      <PolicyModal document={policyOpen} onClose={() => setPolicyOpen(null)} />
    </KeyboardAvoidingView>
  );
}

function LegalAcceptance({
  acceptedTerms,
  acceptedPrivacy,
  termsError,
  privacyError,
  onToggleTerms,
  onTogglePrivacy,
  onOpenPolicy,
}: {
  acceptedTerms: boolean;
  acceptedPrivacy: boolean;
  termsError?: string;
  privacyError?: string;
  onToggleTerms: () => void;
  onTogglePrivacy: () => void;
  onOpenPolicy: (document: PolicyDocument) => void;
}) {
  return (
    <View className="gap-3 rounded-2xl border border-border bg-surface px-4 py-4">
      <PolicyCheckRow
        checked={acceptedTerms}
        label="I agree to the"
        buttonLabel="Terms of Service"
        error={termsError}
        onToggle={onToggleTerms}
        onOpen={() => onOpenPolicy("terms")}
      />
      <PolicyCheckRow
        checked={acceptedPrivacy}
        label="I agree to the"
        buttonLabel="Privacy Policy"
        error={privacyError}
        onToggle={onTogglePrivacy}
        onOpen={() => onOpenPolicy("privacy")}
      />
    </View>
  );
}

function PolicyCheckRow({
  checked,
  label,
  buttonLabel,
  error,
  onToggle,
  onOpen,
}: {
  checked: boolean;
  label: string;
  buttonLabel: string;
  error?: string;
  onToggle: () => void;
  onOpen: () => void;
}) {
  const { theme } = useAppTheme();
  return (
    <View>
      <View className="flex-row items-center gap-3">
        <PressableSurface
          onPress={onToggle}
          accessibilityRole="checkbox"
          accessibilityState={{ checked }}
          className={`h-6 w-6 items-center justify-center rounded-md border ${
            checked ? "border-brand bg-brand" : "border-border bg-surface"
          }`}
        >
          {checked ? <Check size={16} color={theme.primaryForeground} /> : null}
        </PressableSurface>
        <Text className="font-sans text-sm text-foreground">{label}</Text>
        <PressableSurface onPress={onOpen} accessibilityRole="button">
          <Text className="font-sans text-sm font-semibold text-brand">{buttonLabel}</Text>
        </PressableSurface>
      </View>
      {error ? <Text className="font-sans text-error text-xs mt-1 ml-9">{error}</Text> : null}
    </View>
  );
}

function PolicyModal({
  document,
  onClose,
}: {
  document: PolicyDocument | null;
  onClose: () => void;
}) {
  const { theme } = useAppTheme();
  const insets = useSafeAreaInsets();
  const [body, setBody] = useState<string | null>(null);

  useEffect(() => {
    if (!document) {
      setBody(null);
      return;
    }
    const module = document === "terms"
      ? require("../../../../assets/legal/terms.txt")
      : require("../../../../assets/legal/privacy.txt");
    const asset = Asset.fromModule(module);
    setBody(null);
    void asset.downloadAsync()
      .then(() => asset.localUri ? FileSystem.readAsStringAsync(asset.localUri) : Promise.reject(new Error("Missing legal asset URI")))
      .then(setBody)
      .catch(() => setBody(""));
  }, [document]);

  const title = document === "terms" ? "Terms of Service" : "Privacy Policy";
  const paragraphs = body?.split(/\r?\n\s*\r?\n/).map((paragraph) => paragraph.trim()).filter(Boolean) ?? [];
  return (
    <Modal visible={Boolean(document)} animationType="slide" transparent presentationStyle="overFullScreen" onRequestClose={onClose}>
      <View style={[styles.policyPageOverlay, { backgroundColor: theme.overlay, paddingTop: insets.top + 12 }]}>
        <View style={[styles.policyPage, { backgroundColor: theme.surfaceStrong }]}>
          <View style={[styles.policyPageHeader, { borderBottomColor: theme.border }]}>
            <PressableSurface onPress={onClose} style={styles.policyHeaderButton} hitSlop={8}>
              <X size={22} color={theme.textMuted} />
            </PressableSurface>
            <Text className="font-heading text-xl" style={[styles.policyPageTitle, { color: theme.text }]} numberOfLines={1}>
              {title}
            </Text>
            <View style={styles.policyHeaderButton} />
          </View>
          <ScrollView contentContainerStyle={styles.policyPageContent}>
            {body === null ? <Text className="font-sans leading-6" style={{ color: theme.textMuted }}>Loading document…</Text> : null}
            {body === "" ? <Text className="font-sans leading-6" style={{ color: theme.textMuted }}>Unable to load this document. Please try again.</Text> : null}
            {paragraphs.map((paragraph) => (
              <Text key={paragraph} className="mb-4 font-sans leading-6" style={{ color: theme.textMuted }}>
                {paragraph}
              </Text>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

function CenteredDialog({
  visible,
  title,
  children,
  onClose,
}: {
  visible: boolean;
  title: string;
  children: React.ReactNode;
  onClose: () => void;
}) {
  const { theme } = useAppTheme();
  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <View style={[styles.dialogOverlay, { backgroundColor: theme.overlay }]}>
        <View
          style={[
            styles.dialog,
            { backgroundColor: theme.surfaceStrong, borderColor: theme.border },
          ]}
        >
          <View style={[styles.dialogHeader, { borderBottomColor: theme.border }]}>
            <Text className="font-heading text-xl" style={[styles.dialogTitle, { color: theme.text }]} numberOfLines={2}>
              {title}
            </Text>
            <PressableSurface onPress={onClose} className="rounded-lg px-3 py-2">
              <Text className="font-sans font-semibold" style={{ color: theme.primary }}>Done</Text>
            </PressableSurface>
          </View>
          <View style={styles.dialogBody}>{children}</View>
        </View>
      </View>
    </Modal>
  );
}

function SelectionField({
  label,
  value,
  options,
  error,
  onChange,
}: {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  error?: string;
  onChange: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const { theme } = useAppTheme();
  const selected = options.find((option) => option.value === value);
  return (
    <View>
      <Text className="font-sans text-sm text-muted-foreground mb-2">{label}</Text>
      <PressableSurface
        onPress={() => setOpen(true)}
        className={`rounded-xl border bg-surface px-4 py-3 ${error ? "border-error" : "border-border"}`}
      >
        <Text className="font-sans text-foreground">{selected?.label ?? `Select ${label.toLowerCase()}`}</Text>
      </PressableSurface>
      {error ? <Text className="font-sans text-error text-xs mt-1">{error}</Text> : null}
      <CenteredDialog visible={open} title={label} onClose={() => setOpen(false)}>
        <ScrollView style={styles.optionScroll}>
          {options.map((option) => {
            const active = option.value === value;
            return (
              <PressableSurface
                key={option.value}
                onPress={() => {
                  onChange(option.value);
                  setOpen(false);
                }}
                className="rounded-xl px-4 py-3"
                style={{ backgroundColor: active ? theme.surfaceMuted : theme.surfaceStrong }}
              >
                <Text className="font-sans font-semibold" style={{ color: active ? theme.primary : theme.text }}>
                  {option.label}
                </Text>
              </PressableSurface>
            );
          })}
        </ScrollView>
      </CenteredDialog>
    </View>
  );
}

function CalendarField({
  label,
  value,
  error,
  onChange,
}: {
  label: string;
  value: string;
  error?: string;
  onChange: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const { theme } = useAppTheme();
  const maxYear = new Date().getFullYear();
  const minYear = 1990;
  const initial = parseDateParts(value, 2010, 0, 1);
  const [draftYear, setDraftYear] = useState(initial.year);
  const [draftMonth, setDraftMonth] = useState(initial.month);
  const [draftDay, setDraftDay] = useState(initial.day);
  const years = Array.from({ length: maxYear - minYear + 1 }, (_, index) => maxYear - index);
  const days = Array.from({ length: daysInMonth(draftYear, draftMonth) }, (_, index) => index + 1);

  const openPicker = () => {
    const parts = parseDateParts(value, 2010, 0, 1);
    setDraftYear(parts.year);
    setDraftMonth(parts.month);
    setDraftDay(parts.day);
    setOpen(true);
  };

  const updateDraftMonth = (month: number) => {
    setDraftMonth(month);
    setDraftDay((current) => Math.min(current, daysInMonth(draftYear, month)));
  };

  const updateDraftYear = (year: number) => {
    setDraftYear(year);
    setDraftDay((current) => Math.min(current, daysInMonth(year, draftMonth)));
  };

  const applyDate = () => {
    onChange(dateString(draftYear, draftMonth, draftDay));
    setOpen(false);
  };

  return (
    <View>
      <Text className="font-sans text-sm text-muted-foreground mb-2">{label}</Text>
      <PressableSurface
        onPress={openPicker}
        className={`rounded-xl border bg-surface px-4 py-3 ${error ? "border-error" : "border-border"}`}
      >
        <Text className="font-sans text-foreground">{formatDateLabel(value)}</Text>
      </PressableSurface>
      {error ? <Text className="font-sans text-error text-xs mt-1">{error}</Text> : null}
      <CenteredDialog visible={open} title={label} onClose={applyDate}>
        <Text className="mb-4 font-sans text-center font-semibold" style={{ color: theme.text }}>
          {formatDateLabel(dateString(draftYear, draftMonth, draftDay))}
        </Text>
        <View className="flex-row gap-3">
          <DateColumn
            label="Month"
            values={MONTHS.map((month, index) => ({ label: month, value: index }))}
            selected={draftMonth}
            onSelect={updateDraftMonth}
          />
          <DateColumn
            label="Day"
            values={days.map((day) => ({ label: String(day), value: day }))}
            selected={draftDay}
            onSelect={setDraftDay}
          />
          <DateColumn
            label="Year"
            values={years.map((year) => ({ label: String(year), value: year }))}
            selected={draftYear}
            onSelect={updateDraftYear}
          />
        </View>
      </CenteredDialog>
    </View>
  );
}

function parseDateParts(value: string, fallbackYear: number, fallbackMonth: number, fallbackDay: number) {
  const parsed = value ? new Date(`${value}T00:00:00`) : null;
  if (!parsed || Number.isNaN(parsed.getTime())) {
    return { year: fallbackYear, month: fallbackMonth, day: fallbackDay };
  }
  return {
    year: parsed.getFullYear(),
    month: parsed.getMonth(),
    day: parsed.getDate(),
  };
}

function DateColumn({
  label,
  values,
  selected,
  onSelect,
}: {
  label: string;
  values: { label: string; value: number }[];
  selected: number;
  onSelect: (value: number) => void;
}) {
  const { theme } = useAppTheme();
  return (
    <View className="flex-1">
      <Text className="mb-2 text-center font-sans text-xs font-semibold" style={{ color: theme.textMuted }}>{label}</Text>
      <ScrollView
        nestedScrollEnabled
        style={[styles.dateColumn, { backgroundColor: theme.surface, borderColor: theme.border }]}
      >
        {values.map((item) => {
          const active = item.value === selected;
          return (
            <PressableSurface
              key={`${label}-${item.value}`}
              onPress={() => onSelect(item.value)}
              className="items-center px-2 py-3"
              style={{ backgroundColor: active ? theme.surfaceMuted : theme.surface }}
            >
              <Text className="font-sans text-sm" style={{ color: active ? theme.primary : theme.text, fontWeight: active ? "600" : "400" }}>
                {item.label}
              </Text>
            </PressableSurface>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  dialogOverlay: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
  },
  dialog: {
    maxHeight: "82%",
    width: "100%",
    borderRadius: 24,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: "hidden",
  },
  dialogHeader: {
    alignItems: "center",
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    gap: 12,
    justifyContent: "space-between",
    paddingHorizontal: 18,
    paddingVertical: 14,
  },
  dialogTitle: {
    flex: 1,
  },
  dialogBody: {
    padding: 16,
  },
  optionScroll: {
    maxHeight: 360,
  },
  dateColumn: {
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    maxHeight: 256,
  },
  policyPageOverlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  policyPage: {
    flex: 1,
  },
  policyPageHeader: {
    alignItems: "center",
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    gap: 12,
    justifyContent: "space-between",
    paddingHorizontal: 18,
    paddingVertical: 14,
  },
  policyHeaderButton: {
    alignItems: "center",
    height: 32,
    justifyContent: "center",
    width: 32,
  },
  policyPageTitle: {
    flex: 1,
    textAlign: "center",
  },
  policyPageContent: {
    padding: 18,
    paddingBottom: 28,
  },
});

function PrimaryButton({
  label,
  loading,
  disabled,
  onPress,
  color,
}: {
  label: string;
  loading: boolean;
  disabled?: boolean;
  onPress: () => void;
  color: string;
}) {
  return (
    <PressableSurface
      onPress={onPress}
      disabled={disabled || loading}
      className="items-center rounded-xl bg-brand py-3.5"
      style={{ minHeight: 52 }}
    >
      {loading ? (
        <ActivityIndicator color={color} />
      ) : (
        <Text style={{ color }} className="font-sans text-base font-semibold">{label}</Text>
      )}
    </PressableSurface>
  );
}

function TierCard({
  title,
  price,
  bullets,
  selected,
  onPress,
}: {
  title: string;
  price: string;
  bullets: string[];
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <PressableSurface onPress={onPress} className={`rounded-2xl border px-4 py-4 ${selected ? "border-brand bg-brand/10" : "border-border bg-surface"}`}>
      <View className="flex-row flex-wrap items-center justify-between gap-2">
        <Text className="font-sans text-foreground text-lg font-semibold">{title}</Text>
        <Text className="font-sans text-foreground font-semibold">{price}</Text>
      </View>
      {bullets.length ? (
        <View className="mt-3 gap-1">
          {bullets.map((bullet) => (
            <Text key={bullet} className="font-sans text-muted-foreground text-sm">{bullet}</Text>
          ))}
        </View>
      ) : null}
    </PressableSurface>
  );
}
