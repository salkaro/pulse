// Local Imports
import { IOrganisation } from "@/models/organisation";
import { retrieveOrganisation } from "@/services/firebase/retrieve";
import { getCookie, setCookie } from "@/utils/cookie-handlers";
import { organisationCookieKey } from "@/constants/cookies";

// External Imports
import { useCallback, useEffect, useState } from "react";
import { useSession } from "next-auth/react";


interface UseOrganisationReturn {
    organisation: IOrganisation | null;
    loading: boolean;
    error: string | null;
    refetch: () => Promise<void>;
}

export function useOrganisation(): UseOrganisationReturn {
    const { data: session, status } = useSession();
    const [organisation, setOrganisation] = useState<IOrganisation | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const fetchOrganisation = useCallback(async ({ reload }: { reload?: boolean }) => {
        // Reset states
        setLoading(true);
        setError(null);

        try {
            // Check if user is authenticated and has an organisation ID
            if (!session?.user?.organisation?.id) {
                setOrganisation(null);
                setLoading(false);
                return;
            }

            const cookieKey = `${session.user.organisation.id}_${organisationCookieKey}`;

            if (!reload) {
                // Check if organisation data is already cached in cookies
                const cached = getCookie(cookieKey);
                if (cached) {
                    try {

                        setOrganisation(JSON.parse(cached));
                        setLoading(false);
                        return;
                    } catch {}
                }
            }

            // Retrieve organisation data
            const orgData = await retrieveOrganisation({
                orgId: session.user.organisation.id
            });

            if (orgData) {
                // Cache the organisation data in a cookie
                setCookie(cookieKey, JSON.stringify(orgData), { expires: 7, path: '/' });
                setOrganisation(orgData);
            } else {
                setOrganisation(null);
                setError('Organisation not found');
            }
        } catch (err) {
            console.error('Error fetching organisation:', err);
            setError(err instanceof Error ? err.message : 'Failed to fetch organisation');
            setOrganisation(null);
        } finally {
            setLoading(false);
        }
    }, [session?.user?.organisation?.id]);

    // Fetch organisation when session changes
    useEffect(() => {
        if (status === 'loading') {
            setLoading(true);
            return;
        }

        if (status === 'unauthenticated') {
            setOrganisation(null);
            setLoading(false);
            setError(null);
            return;
        }

        fetchOrganisation({});
    }, [session, status, fetchOrganisation]);

    const refetch = useCallback(async () => {
        await fetchOrganisation({ reload: true });
    }, [fetchOrganisation]);

    return {
        organisation,
        loading,
        error,
        refetch,
    };
}
