"use client";

// External Imports
import { useState, useEffect, useCallback } from "react";

// Local Imports
import { IAutomation } from "@/models/automation";
import { retrieveAutomations } from "@/services/firebase/automations/retrieve";
import { automationsCookieKey } from "@/constants/cookies";
import { getSessionStorage, setSessionStorage } from "@/utils/storage-handlers";

interface UseAutomationsReturn {
    automations: IAutomation[] | null;
    loading: boolean;
    error: string | null;
    refetch: () => Promise<void>;
}

export function useAutomations(
    organisationId: string | null,
    entityId: string | null
): UseAutomationsReturn {
    const [automations, setAutomations] = useState<IAutomation[] | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const fetchAutomations = useCallback(
        async ({ reload = false } = {}) => {
            if (!organisationId || !entityId) {
                setAutomations(null);
                setError(!organisationId ? "No organisation ID provided" : "No entity ID provided");
                return;
            }

            setLoading(true);
            setError(null);

            try {
                const storageKey = `${organisationId}_${entityId}_${automationsCookieKey}`;

                // Step 1: Try sessionStorage cache
                if (!reload) {
                    const cached = getSessionStorage(storageKey);
                    if (cached) {
                        setAutomations(JSON.parse(cached));
                        setLoading(false);
                        return;
                    }
                }

                // Step 2: Fetch from Firestore via backend
                const { automations: fetched, error: err } = await retrieveAutomations({
                    organisationId,
                    entityId,
                });

                if (err) {
                    throw new Error(err);
                }

                setAutomations(fetched ?? []);
                // Step 3: Cache in sessionStorage (persists for the session)
                setSessionStorage(storageKey, JSON.stringify(fetched ?? []));
            } catch (err) {
                setError(err instanceof Error ? err.message : "Failed to fetch automations");
                setAutomations(null);
            } finally {
                setLoading(false);
            }
        },
        [organisationId, entityId]
    );

    useEffect(() => {
        fetchAutomations();
    }, [fetchAutomations]);

    const refetch = useCallback(async () => {
        await fetchAutomations({ reload: true });
    }, [fetchAutomations]);

    return { automations, loading, error, refetch };
}
