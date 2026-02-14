"use strict";
/**
 * FAZA 1.7 - ANAF Health Hook
 *
 * React Query hook for fetching ANAF health dashboard data
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.useAnafHealth = useAnafHealth;
var react_query_1 = require("@tanstack/react-query");
var anaf_api_1 = require("../api/anaf.api");
function useAnafHealth() {
    return (0, react_query_1.useQuery)({
        queryKey: ['anaf', 'health'],
        queryFn: anaf_api_1.fetchAnafHealth,
        refetchInterval: 30000, // Refresh every 30 seconds
        staleTime: 10000, // Consider data stale after 10 seconds
    });
}
