// import { useTranslation } from '@/i18n/I18nContext';
/**
 * FAZA 1.2 - Certificate Management Hook
 * 
 * React Query hooks for certificate operations
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  fetchCertificateStatus, 
  uploadCertificate, 
  deleteCertificate 
} from '../api/anaf.api';

/**
 * Hook for fetching certificate status
 */
export function useCertificateStatus() {
  return useQuery({
    queryKey: ['anaf', 'certificate', 'status'],
    queryFn: fetchCertificateStatus,
    refetchInterval: 60000, // Refresh every minute
  });
}

/**
 * Hook for uploading certificate
 */
export function useUploadCertificate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ file, password }: { file: File; password: string }) =>
      uploadCertificate(file, password),
    onSuccess: () => {
      // Invalidate and refetch certificate status
      queryClient.invalidateQueries({ queryKey: ['anaf', 'certificate'] });
      queryClient.invalidateQueries({ queryKey: ['anaf', 'health'] });
    },
  });
}

/**
 * Hook for deleting certificate
 */
export function useDeleteCertificate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteCertificate,
    onSuccess: () => {
      // Invalidate and refetch certificate status
      queryClient.invalidateQueries({ queryKey: ['anaf', 'certificate'] });
      queryClient.invalidateQueries({ queryKey: ['anaf', 'health'] });
    },
  });
}

