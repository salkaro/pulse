"use client";

// External Imports
import { useState, useEffect, useCallback } from "react";

// Local Imports
import { IConnection } from "@/models/connection";
import { connectionsCookieKey } from "@/constants/cookies";
import { getCookie, setCookie, removeCookie } from "@/utils/cookie-handlers";

interface UseConnectionsReturn {
    connections: IConnection[] | null;
    loading: boolean;
    error: string | null;
    refetch: () => Promise<void>;
}

export function useConnections(organisationId: string | null): UseConnectionsReturn {
    const [connections, setConnections] = useState<IConnection[] | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const fetchConnections = useCallback(
        async ({ reload = false } = {}) => {
            if (!organisationId) {
                setConnections(null);
                setError("No organisation ID provided");
                return;
            }

            setLoading(true);
            setError(null);

            try {
                const cookieKey = `${organisationId}_${connectionsCookieKey}`;

                // Step 1: Try cache
                if (!reload) {
                    const cached = getCookie(cookieKey);
                    if (cached) {
                        setConnections(JSON.parse(cached));
                        setLoading(false);
                        return;
                    }
                }

                // Step 2: Fetch from API
                const response = await fetch('/api/connections/status');
                if (!response.ok) {
                    throw new Error('Failed to fetch connections');
                }
                const data = await response.json();
                const fetched = data.connections || [];

                setConnections(fetched);
                // Step 3: Cache for 1 hour
                setCookie(cookieKey, JSON.stringify(fetched), { expires: 1 / 24 });
            } catch (err) {
                setError(err instanceof Error ? err.message : "Failed to fetch connections");
                setConnections(null);
            } finally {
                setLoading(false);
            }
        },
        [organisationId]
    );

    useEffect(() => {
        fetchConnections();
    }, [fetchConnections]);

    const refetch = useCallback(async () => {
        // Clear the cache before refetching
        if (organisationId) {
            const cookieKey = `${organisationId}_${connectionsCookieKey}`;
            removeCookie(cookieKey);
        }
        await fetchConnections({ reload: true });
    }, [fetchConnections, organisationId]);

    return { connections, loading, error, refetch };
}
