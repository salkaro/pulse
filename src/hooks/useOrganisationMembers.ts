// Local Imports
import { IUser } from "@/models/user";
import { membersCookieKey } from "@/constants/cookies";
import { withTokenRefresh } from "@/utils/token-refresh";
import { getSessionStorage, setSessionStorage } from "@/utils/storage-handlers";
import { retrieveOrganisationMembers } from "@/services/firebase/admin-retrieve";

// External Imports
import { useState, useEffect, useCallback } from "react";

interface UseOrganisationMembersReturn {
    members: IUser[] | null;
    loading: boolean;
    error: string | null;
    refetch: () => Promise<void>;
}

export function useOrganisationMembers(orgId: string | null): UseOrganisationMembersReturn {
    const [members, setMembers] = useState<IUser[] | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const fetchMembers = useCallback(
        async ({ reload = false } = {}) => {
            if (!orgId) {
                setMembers(null);
                setError("No organisation ID provided");
                return;
            }

            setLoading(true);
            setError(null);

            try {
                const storageKey = `${orgId}_${membersCookieKey}`;

                // Step 1: Try sessionStorage cache
                if (!reload) {
                    const cached = getSessionStorage(storageKey);
                    if (cached) {
                        setMembers(JSON.parse(cached));
                        setLoading(false);
                        return;
                    }
                }

                // Step 2: Fetch from backend with automatic token refresh
                const { members: fetched, error: err } = await withTokenRefresh(
                    (idToken) => retrieveOrganisationMembers({ idToken, orgId })
                );
                if (err) {
                    throw new Error(err);
                }

                setMembers(fetched ?? []);
                // Step 4: Cache in sessionStorage (persists for the session)
                setSessionStorage(storageKey, JSON.stringify(fetched ?? []));
            } catch (err) {
                setError(err instanceof Error ? err.message : "Failed to fetch members");
                setMembers(null);
            } finally {
                setLoading(false);
            }
        },
        [orgId]
    );

    useEffect(() => {
        fetchMembers();
    }, [fetchMembers]);

    const refetch = useCallback(async () => {
        await fetchMembers({ reload: true });
    }, [fetchMembers]);

    return { members, loading, error, refetch };
}
