import { z } from "zod";

export const loginSchema = z.object({
  username: z.string().min(1, "Username or email is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  portal: z.enum(["teen", "mentor"]).optional(),
});

export const registerStep2Schema = z
  .object({
    username: z
      .string()
      .min(3, "Username must be at least 3 characters")
      .regex(
        /^[a-z0-9_]+$/,
        "Only lowercase letters, numbers, and underscores",
      ),
    email: z.string().email("Invalid email"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    birthdate: z.string().min(1, "Birthdate is required"),
    state: z.string().optional(),
    grade: z.number().min(0).max(12).optional(),
    phone: z.string().optional(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export const onboardingProfileSchema = z
  .object({
    username: z
      .string()
      .min(3, "Username must be at least 3 characters")
      .regex(
        /^[a-z0-9_]+$/,
        "Only lowercase letters, numbers, and underscores",
      ),
    email: z.string().email("Invalid email"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
    firstName: z
      .string()
      .min(1, "First name is required")
      .regex(/^[A-Za-z][A-Za-z' -]*$/, "First name has invalid characters"),
    lastName: z
      .string()
      .min(1, "Last name is required")
      .regex(/^[A-Za-z][A-Za-z' -]*$/, "Last name has invalid characters"),
    birthdate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Select a valid birthdate"),
    state: z.string().regex(/^[A-Z]{2}$/, "Select a state"),
    grade: z.number().min(0).max(12),
    phone: z
      .string()
      .regex(/^\+?[0-9 ().-]{7,20}$/, "Enter a valid phone number"),
    timezone: z
      .string()
      .regex(/^[A-Za-z_]+\/[A-Za-z_/-]+$/, "Select a timezone"),
    acceptedTerms: z
      .boolean()
      .refine(Boolean, "Terms of Service must be accepted"),
    acceptedPrivacy: z
      .boolean()
      .refine(Boolean, "Privacy Policy must be accepted"),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export const mentorApplicationSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email"),
  phone: z.string().min(1, "Phone is required"),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email"),
});

export const resetPasswordSchema = z
  .object({
    newPassword: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export const profileUpdateSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  state: z.string().optional(),
  grade: z.coerce.number().min(0).max(12).optional(),
  timezone: z.string().optional(),
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterStep2Data = z.infer<typeof registerStep2Schema>;
export type OnboardingProfileData = z.infer<typeof onboardingProfileSchema>;
export type MentorApplicationData = z.infer<typeof mentorApplicationSchema>;
export type ForgotPasswordData = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordData = z.infer<typeof resetPasswordSchema>;
export type ChangePasswordData = z.infer<typeof changePasswordSchema>;
export type ProfileUpdateData = z.infer<typeof profileUpdateSchema>;
