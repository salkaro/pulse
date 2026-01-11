"use client";

// External Imports
import { useState, useEffect, useCallback } from "react";

// Local Imports
import type {
    AnalyticsMetrics,
    PageAnalytics,
    TrafficSource,
    ConversionEvent,
} from "@/services/google/analytics";
import { getSessionStorage, setSessionStorage } from "@/utils/storage-handlers";
import { analyticsCookieKey } from "@/constants/cookies";

interface DateRange {
    startDate: string;
    endDate: string;
}

interface AnalyticsData {
    metrics: AnalyticsMetrics | null;
    pages: PageAnalytics[];
    traffic: TrafficSource[];
    conversions: ConversionEvent[];
    realtimeUsers: number;
    properties: Array<{
        name: string;
        propertyId: string;
        displayName: string;
        websiteUrl?: string;
    }>;
}

interface UseAnalyticsOptions {
    propertyId?: string;
    connectionId?: string;
    startDate?: string;
    endDate?: string;
    enabled?: boolean;
}

interface UseAnalyticsReturn {
    data: AnalyticsData | null;
    loading: boolean;
    error: string | null;
    refetch: () => Promise<void>;
    fetchMetrics: () => Promise<void>;
    fetchPages: (limit?: number) => Promise<void>;
    fetchTraffic: (limit?: number) => Promise<void>;
    fetchConversions: () => Promise<void>;
    fetchRealtime: () => Promise<void>;
    fetchProperties: () => Promise<void>;
}

export function useAnalytics(
    organisationId: string | null,
    options: UseAnalyticsOptions = {}
): UseAnalyticsReturn {
    const {
        propertyId,
        connectionId,
        startDate = "30daysAgo",
        endDate = "today",
        enabled = true,
    } = options;

    const [data, setData] = useState<AnalyticsData | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    // Build cache key
    const getCacheKey = useCallback(
        (type: string) => {
            return `${organisationId}_${connectionId || "org"}_${propertyId || "all"}_${type}_${analyticsCookieKey}`;
        },
        [organisationId, connectionId, propertyId]
    );

    // Fetch metrics
    const fetchMetrics = useCallback(
        async ({ reload = false } = {}) => {
            if (!organisationId || !propertyId || !connectionId || !enabled) return;

            setLoading(true);
            setError(null);

            try {
                const cacheKey = getCacheKey("metrics");

                // Try cache first
                if (!reload) {
                    const cached = getSessionStorage(cacheKey);
                    if (cached) {
                        const cachedData = JSON.parse(cached);
                        setData((prev) => ({ ...prev!, metrics: cachedData }));
                        setLoading(false);
                        return;
                    }
                }

                const params = new URLSearchParams({
                    propertyId,
                    connectionId,
                    startDate,
                    endDate,
                });

                const response = await fetch(`/api/analytics/metrics?${params}`);
                if (!response.ok) {
                    throw new Error("Failed to fetch metrics");
                }

                const result = await response.json();
                if (!result.success) {
                    throw new Error(result.error || "Failed to fetch metrics");
                }

                setData((prev) => ({
                    ...prev!,
                    metrics: result.data,
                }));

                // Cache for 5 minutes
                setSessionStorage(cacheKey, JSON.stringify(result.data));
            } catch (err) {
                setError(err instanceof Error ? err.message : "Failed to fetch metrics");
            } finally {
                setLoading(false);
            }
        },
        [organisationId, propertyId, connectionId, startDate, endDate, enabled, getCacheKey]
    );

    // Fetch pages
    const fetchPages = useCallback(
        async (limit = 10, { reload = false } = {}) => {
            if (!organisationId || !propertyId || !connectionId || !enabled) return;

            try {
                const cacheKey = getCacheKey("pages");

                if (!reload) {
                    const cached = getSessionStorage(cacheKey);
                    if (cached) {
                        const cachedData = JSON.parse(cached);
                        setData((prev) => ({ ...prev!, pages: cachedData }));
                        return;
                    }
                }

                const params = new URLSearchParams({
                    propertyId,
                    connectionId,
                    startDate,
                    endDate,
                    limit: limit.toString(),
                });

                const response = await fetch(`/api/analytics/pages?${params}`);
                if (!response.ok) throw new Error("Failed to fetch pages");

                const result = await response.json();
                if (!result.success) throw new Error(result.error || "Failed to fetch pages");

                setData((prev) => ({
                    ...prev!,
                    pages: result.data,
                }));

                setSessionStorage(cacheKey, JSON.stringify(result.data));
            } catch (err) {
                console.error("Error fetching pages:", err);
            }
        },
        [organisationId, propertyId, connectionId, startDate, endDate, enabled, getCacheKey]
    );

    // Fetch traffic
    const fetchTraffic = useCallback(
        async (limit = 10, { reload = false } = {}) => {
            if (!organisationId || !propertyId || !connectionId || !enabled) return;

            try {
                const cacheKey = getCacheKey("traffic");

                if (!reload) {
                    const cached = getSessionStorage(cacheKey);
                    if (cached) {
                        const cachedData = JSON.parse(cached);
                        setData((prev) => ({ ...prev!, traffic: cachedData }));
                        return;
                    }
                }

                const params = new URLSearchParams({
                    propertyId,
                    connectionId,
                    startDate,
                    endDate,
                    limit: limit.toString(),
                });

                const response = await fetch(`/api/analytics/traffic?${params}`);
                if (!response.ok) throw new Error("Failed to fetch traffic");

                const result = await response.json();
                if (!result.success) throw new Error(result.error || "Failed to fetch traffic");

                setData((prev) => ({
                    ...prev!,
                    traffic: result.data,
                }));

                setSessionStorage(cacheKey, JSON.stringify(result.data));
            } catch (err) {
                console.error("Error fetching traffic:", err);
            }
        },
        [organisationId, propertyId, connectionId, startDate, endDate, enabled, getCacheKey]
    );

    // Fetch conversions
    const fetchConversions = useCallback(
        async ({ reload = false } = {}) => {
            if (!organisationId || !propertyId || !connectionId || !enabled) return;

            try {
                const cacheKey = getCacheKey("conversions");

                if (!reload) {
                    const cached = getSessionStorage(cacheKey);
                    if (cached) {
                        const cachedData = JSON.parse(cached);
                        setData((prev) => ({ ...prev!, conversions: cachedData }));
                        return;
                    }
                }

                const params = new URLSearchParams({
                    propertyId,
                    connectionId,
                    startDate,
                    endDate,
                });

                const response = await fetch(`/api/analytics/conversions?${params}`);
                if (!response.ok) throw new Error("Failed to fetch conversions");

                const result = await response.json();
                if (!result.success) throw new Error(result.error || "Failed to fetch conversions");

                setData((prev) => ({
                    ...prev!,
                    conversions: result.data,
                }));

                setSessionStorage(cacheKey, JSON.stringify(result.data));
            } catch (err) {
                console.error("Error fetching conversions:", err);
            }
        },
        [organisationId, propertyId, connectionId, startDate, endDate, enabled, getCacheKey]
    );

    // Fetch realtime (no cache)
    const fetchRealtime = useCallback(async () => {
        if (!organisationId || !propertyId || !connectionId || !enabled) return;

        try {
            const params = new URLSearchParams({
                propertyId,
                connectionId
            });

            const response = await fetch(`/api/analytics/realtime?${params}`);
            if (!response.ok) throw new Error("Failed to fetch realtime");

            const result = await response.json();
            if (!result.success) throw new Error(result.error || "Failed to fetch realtime");

            setData((prev) => ({
                ...prev!,
                realtimeUsers: result.data.activeUsers,
            }));
        } catch (err) {
            console.error("Error fetching realtime:", err);
        }
    }, [organisationId, propertyId, connectionId, enabled]);

    // Fetch properties
    const fetchProperties = useCallback(
        async ({ reload = false } = {}) => {
            if (!organisationId || !connectionId || !enabled) return;

            try {
                const cacheKey = getCacheKey("properties");

                if (!reload) {
                    const cached = getSessionStorage(cacheKey);
                    if (cached) {
                        const cachedData = JSON.parse(cached);
                        setData((prev) => ({ ...prev!, properties: cachedData }));
                        return;
                    }
                }

                const params = new URLSearchParams({
                    connectionId
                });

                const response = await fetch(`/api/analytics/properties?${params}`);
                if (!response.ok) throw new Error("Failed to fetch properties");

                const result = await response.json();
                if (!result.success) throw new Error(result.error || "Failed to fetch properties");

                setData((prev) => ({
                    ...prev!,
                    properties: result.data,
                }));

                //setSessionStorage(cacheKey, JSON.stringify(result.data));
            } catch (err) {
                console.error("Error fetching properties:", err);
            }
        },
        [organisationId, connectionId, enabled, getCacheKey]
    );

    // Initialize data structure
    useEffect(() => {
        if (!data) {
            setData({
                metrics: null,
                pages: [],
                traffic: [],
                conversions: [],
                realtimeUsers: 0,
                properties: [],
            });
        }
    }, [data]);

    // Auto-fetch properties when connection changes (doesn't require propertyId)
    useEffect(() => {
        if (enabled && organisationId && connectionId) {
            fetchProperties();
        }
    }, [enabled, organisationId, connectionId, fetchProperties]);

    // Auto-fetch analytics data when propertyId is selected
    useEffect(() => {
        if (enabled && organisationId && propertyId && connectionId) {
            fetchMetrics();
            fetchPages();
            fetchTraffic();
            fetchConversions();
            fetchRealtime();
        }
    }, [enabled, organisationId, propertyId, connectionId, fetchMetrics, fetchPages, fetchTraffic, fetchConversions, fetchRealtime]);

    // Refetch all data
    const refetch = useCallback(async () => {
        if (!propertyId) {
            await fetchProperties({ reload: true });
            return;
        }

        await Promise.all([
            fetchMetrics({ reload: true }),
            fetchPages(10, { reload: true }),
            fetchTraffic(10, { reload: true }),
            fetchConversions({ reload: true }),
            fetchRealtime(),
        ]);
    }, [propertyId, fetchMetrics, fetchPages, fetchTraffic, fetchConversions, fetchRealtime, fetchProperties]);

    return {
        data,
        loading,
        error,
        refetch,
        fetchMetrics,
        fetchPages,
        fetchTraffic,
        fetchConversions,
        fetchRealtime,
        fetchProperties,
    };
}
