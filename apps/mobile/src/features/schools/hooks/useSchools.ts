import { useQuery } from "@tanstack/react-query";
import * as schoolsService from "@/features/schools/services/schools.service";

export function useSchools() {
  return useQuery({ queryKey: ["schools", "list"], queryFn: schoolsService.fetchSchools });
}

export function useSchoolDetail(schoolId: string | undefined) {
  return useQuery({
    queryKey: ["schools", "detail", schoolId],
    queryFn: () => schoolsService.fetchSchoolDetail(schoolId as string),
    enabled: Boolean(schoolId),
  });
}
