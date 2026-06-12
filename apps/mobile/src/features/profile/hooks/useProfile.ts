import { useMutation, useQuery } from "@tanstack/react-query";
import * as profileService from "@/features/profile/services/profile.service";
import * as authService from "@/features/auth/services/auth.service";
import { useSessionStore } from "@/features/auth/store/sessionStore";

export function useProfileQuery() {
  const userId = useSessionStore((s) => s.user?.id);
  return useQuery({
    queryKey: ["profile", "detail", userId],
    queryFn: () => authService.fetchProfile(userId as string),
    enabled: Boolean(userId),
  });
}

export function useUpdateProfile() {
  const setProfile = useSessionStore((s) => s.setProfile);
  return useMutation({
    mutationFn: (params: { userId: string; fullName: string; phone: string | null }) => profileService.updateProfile(params),
    onSuccess: (profile) => setProfile(profile),
  });
}

export function useUploadAvatar() {
  const setProfile = useSessionStore((s) => s.setProfile);
  return useMutation({
    mutationFn: (params: { userId: string; fileUri: string; fileName: string; contentType: string }) =>
      profileService.uploadAvatar(params),
    onSuccess: (profile) => setProfile(profile),
  });
}
