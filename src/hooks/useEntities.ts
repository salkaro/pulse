"use client";

// External Imports
import { useState, useEffect, useCallback } from "react";

// Local Imports
import { IEntity } from "@/models/entity";
import { retrieveEntities } from "@/services/firebase/entities/retrieve";
import { entitiesCookieKey } from "@/constants/cookies";
import { getSessionStorage, setSessionStorage } from "@/utils/storage-handlers";

interface UseEntitiesReturn {
    entities: IEntity[] | null;
    loading: boolean;
    error: string | null;
    refetch: () => Promise<void>;
}

export function useEntities(organisationId: string | null): UseEntitiesReturn {
    const [entities, setEntities] = useState<IEntity[] | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const fetchEntities = useCallback(
        async ({ reload = false } = {}) => {
            if (!organisationId) {
                setEntities(null);
                setError("No organisation ID provided");
                return;
            }

            setLoading(true);
            setError(null);

            try {
                const storageKey = `${organisationId}_${entitiesCookieKey}`;

                // Step 1: Try sessionStorage cache
                if (!reload) {
                    const cached = getSessionStorage(storageKey);
                    if (cached) {
                        setEntities(JSON.parse(cached));
                        setLoading(false);
                        return;
                    }
                }

                // Step 2: Fetch from Firestore via backend
                const { entities: fetched, error: err } = await retrieveEntities({
                    organisationId,
                });

                if (err) {
                    throw new Error(err);
                }

                setEntities(fetched ?? []);
                // Step 3: Cache in sessionStorage (persists for the session)
                setSessionStorage(storageKey, JSON.stringify(fetched ?? []));
            } catch (err) {
                setError(err instanceof Error ? err.message : "Failed to fetch entities");
                setEntities(null);
            } finally {
                setLoading(false);
            }
        },
        [organisationId]
    );

    useEffect(() => {
        fetchEntities();
    }, [fetchEntities]);

    const refetch = useCallback(async () => {
        await fetchEntities({ reload: true });
    }, [fetchEntities]);

    return { entities, loading, error, refetch };
}
