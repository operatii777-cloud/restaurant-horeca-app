"use strict";
// import { useTranslation } from '@/i18n/I18nContext';
/**
 * FAZA 1.2 - Certificate Management Hook
 *
 * React Query hooks for certificate operations
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.useCertificateStatus = useCertificateStatus;
exports.useUploadCertificate = useUploadCertificate;
exports.useDeleteCertificate = useDeleteCertificate;
var react_query_1 = require("@tanstack/react-query");
var anaf_api_1 = require("../api/anaf.api");
/**
 * Hook for fetching certificate status
 */
function useCertificateStatus() {
    return (0, react_query_1.useQuery)({
        queryKey: ['anaf', 'certificate', 'status'],
        queryFn: anaf_api_1.fetchCertificateStatus,
        refetchInterval: 60000, // Refresh every minute
    });
}
/**
 * Hook for uploading certificate
 */
function useUploadCertificate() {
    var queryClient = (0, react_query_1.useQueryClient)();
    return (0, react_query_1.useMutation)({
        mutationFn: function (_a) {
            var file = _a.file, password = _a.password;
            return (0, anaf_api_1.uploadCertificate)(file, password);
        },
        onSuccess: function () {
            // Invalidate and refetch certificate status
            queryClient.invalidateQueries({ queryKey: ['anaf', 'certificate'] });
            queryClient.invalidateQueries({ queryKey: ['anaf', 'health'] });
        },
    });
}
/**
 * Hook for deleting certificate
 */
function useDeleteCertificate() {
    var queryClient = (0, react_query_1.useQueryClient)();
    return (0, react_query_1.useMutation)({
        mutationFn: anaf_api_1.deleteCertificate,
        onSuccess: function () {
            // Invalidate and refetch certificate status
            queryClient.invalidateQueries({ queryKey: ['anaf', 'certificate'] });
            queryClient.invalidateQueries({ queryKey: ['anaf', 'health'] });
        },
    });
}
