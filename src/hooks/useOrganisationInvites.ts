// Local Imports
import { IMemberInvite } from "@/models/invite";
import { invitesCookieKey } from "@/constants/cookies";
import { withTokenRefresh } from "@/utils/token-refresh";
import { getSessionStorage, setSessionStorage } from "@/utils/storage-handlers";
import { retrieveOrganisationInvites } from "@/services/firebase/admin-retrieve";

// External Imports
import { useState, useEffect, useCallback } from "react";

interface UseOrganisationInvitesReturn {
    invites: IMemberInvite[] | null;
    loading: boolean;
    error: string | null;
    refetch: () => Promise<void>;
}

export function useOrganisationInvites(orgId: string | null): UseOrganisationInvitesReturn {
    const [invites, setInvites] = useState<IMemberInvite[] | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const fetchInvites = useCallback(
        async ({ reload = false } = {}) => {
            if (!orgId) {
                setInvites(null);
                setError("No organisation ID provided");
                return;
            }

            setLoading(true);
            setError(null);

            try {
                const storageKey = `${orgId}_${invitesCookieKey}`;

                // Step 1: Try sessionStorage cache
                if (!reload) {
                    const cached = getSessionStorage(storageKey);
                    if (cached) {
                        setInvites(JSON.parse(cached));
                        setLoading(false);
                        return;
                    }
                }

                // Step 2: Fetch from backend with automatic token refresh
                const { invites: fetched, error: err } = await withTokenRefresh(
                    (idToken) => retrieveOrganisationInvites({ idToken, orgId })
                );
                if (err) {
                    throw new Error(err);
                }

                setInvites(fetched ?? []);
                // Step 4: Cache in sessionStorage (persists for the session)
                setSessionStorage(storageKey, JSON.stringify(fetched ?? []));
            } catch (err) {
                setError(err instanceof Error ? err.message : "Failed to fetch invites");
                setInvites(null);
            } finally {
                setLoading(false);
            }
        },
        [orgId]
    );

    useEffect(() => {
        fetchInvites();
    }, [fetchInvites]);

    const refetch = useCallback(async () => {
        await fetchInvites({ reload: true });
    }, [fetchInvites]);

    return { invites, loading, error, refetch };
}
