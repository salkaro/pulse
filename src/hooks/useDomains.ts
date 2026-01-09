"use client";

import { useEffect, useState, useCallback } from "react";
import { IDomain } from "@/models/domain";
import { retrieveDomains } from "@/services/firebase/domains/retrieve";
import { domainsCookieKey } from "@/constants/cookies";
import { getSessionStorage, setSessionStorage, removeSessionStorage } from "@/utils/storage-handlers";

interface UseDomainsReturn {
    domains: IDomain[] | null;
    loading: boolean;
    error: string | null;
    refetch: () => Promise<void>;
}

export function useDomains(organisationId: string | null): UseDomainsReturn {
    const [domains, setDomains] = useState<IDomain[] | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchDomains = useCallback(async (bypassCache = false) => {
        if (!organisationId) {
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            // Check session storage first (unless bypassing cache)
            if (!bypassCache) {
                const cachedString = getSessionStorage(domainsCookieKey);
                if (cachedString) {
                    try {
                        const cached = JSON.parse(cachedString) as IDomain[];
                        setDomains(cached);
                        setLoading(false);
                        return;
                    } catch {
                        // Invalid cached data, continue to fetch fresh
                        removeSessionStorage(domainsCookieKey);
                    }
                }
            }

            const result = await retrieveDomains(organisationId);

            if (result.error) {
                setError(result.error);
                setDomains(null);
            } else if (result.domains) {
                setDomains(result.domains);
                setSessionStorage(domainsCookieKey, JSON.stringify(result.domains));
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to fetch domains");
            setDomains(null);
        } finally {
            setLoading(false);
        }
    }, [organisationId]);

    useEffect(() => {
        fetchDomains();
    }, [fetchDomains]);

    const refetch = useCallback(async () => {
        // Clear cache and fetch fresh data
        removeSessionStorage(domainsCookieKey);
        await fetchDomains(true);
    }, [fetchDomains]);

    return { domains, loading, error, refetch };
}
