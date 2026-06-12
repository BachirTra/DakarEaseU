'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  createSchool,
  deleteSchool,
  fetchSchoolById,
  fetchSchools,
  updateSchool,
  uploadSchoolCoverImage,
} from '../services/schools.service';
import type { School } from '@dakareaseu/types';
import type { SchoolFormValues } from '../schemas/school.schema';

export function useSchools() {
  return useQuery({ queryKey: ['schools'], queryFn: fetchSchools });
}

export function useSchool(id: string | undefined) {
  return useQuery({
    queryKey: ['schools', 'detail', id],
    queryFn: () => fetchSchoolById(id!),
    enabled: !!id,
  });
}

export function useSaveSchool(id?: string) {
  const queryClient = useQueryClient();
  return useMutation<School | undefined, Error, SchoolFormValues>({
    mutationFn: async (values) => {
      if (id) {
        await updateSchool(id, values);
        return undefined;
      }
      return createSchool(values);
    },
    onSuccess: () => {
      toast.success(id ? 'École mise à jour.' : 'École créée.');
      queryClient.invalidateQueries({ queryKey: ['schools'] });
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

export function useDeleteSchool() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteSchool,
    onSuccess: () => {
      toast.success('École supprimée.');
      queryClient.invalidateQueries({ queryKey: ['schools'] });
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

export function useUploadSchoolCoverImage(schoolId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => uploadSchoolCoverImage(schoolId, file),
    onSuccess: () => {
      toast.success('Image de couverture mise à jour.');
      queryClient.invalidateQueries({ queryKey: ['schools'] });
      queryClient.invalidateQueries({ queryKey: ['schools', 'detail', schoolId] });
    },
    onError: (error: Error) => toast.error(error.message),
  });
}
