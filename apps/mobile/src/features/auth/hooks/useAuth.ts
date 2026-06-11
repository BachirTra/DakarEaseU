import { useMutation, useQueryClient } from "@tanstack/react-query";
import * as authService from "@/features/auth/services/auth.service";
import { useSessionStore } from "@/features/auth/store/sessionStore";
import type { LoginInput, SignupInput } from "@/features/auth/schemas/authSchemas";
import type { OnboardingAnswers } from "@/features/auth/lib/derivePersona";

export function useLogin() {
  return useMutation({
    mutationFn: (input: LoginInput) => authService.signInWithPassword(input),
  });
}

export function useSignup() {
  return useMutation({
    mutationFn: (input: SignupInput) => authService.signUpWithPassword(input),
  });
}

export function useLogout() {
  const clear = useSessionStore((s) => s.clear);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => authService.signOut(),
    onSuccess: () => {
      clear();
      queryClient.clear();
    },
  });
}

export function useCompleteOnboarding() {
  const setProfile = useSessionStore((s) => s.setProfile);
  return useMutation({
    mutationFn: (params: { userId: string; fullName: string; schoolId: string | null; answers: OnboardingAnswers }) =>
      authService.completeOnboarding(params),
    onSuccess: (profile) => setProfile(profile),
  });
}

export function useUploadStudentId() {
  const setProfile = useSessionStore((s) => s.setProfile);
  return useMutation({
    mutationFn: (params: { userId: string; fileUri: string; fileName: string; contentType: string }) =>
      authService.uploadStudentId(params),
    onSuccess: (profile) => setProfile(profile),
  });
}
