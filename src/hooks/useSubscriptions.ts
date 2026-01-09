"use client";

// External Imports
import { useState, useEffect, useCallback } from "react";
import Stripe from "stripe";

// Local Imports
import { retrieveStripeSubscriptions } from "@/services/stripe/retrieve";
import { subscriptionsCookieKey } from "@/constants/cookies";
import { getCookie, setCookie } from "@/utils/cookie-handlers";

interface UseSubscriptionsReturn {
    subscriptions: Stripe.Subscription[] | null;
    loading: boolean;
    error: string | null;
    refetch: () => Promise<void>;
}

export function useSubscriptions(organisationId: string | null): UseSubscriptionsReturn {
    const [subscriptions, setSubscriptions] = useState<Stripe.Subscription[] | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const fetchSubscriptions = useCallback(
        async ({ reload = false } = {}) => {
            if (!organisationId) {
                setSubscriptions(null);
                setError("No organisation ID provided");
                return;
            }

            setLoading(true);
            setError(null);

            try {
                const cookieKey = `${organisationId}_${subscriptionsCookieKey}`;

                // Step 1: Try cache
                if (!reload) {
                    const cached = getCookie(cookieKey);
                    if (cached) {
                        setSubscriptions(JSON.parse(cached));
                        setLoading(false);
                        return;
                    }
                }

                // Step 2: Fetch from Stripe via backend
                const { subscriptions: fetched, error: err } = await retrieveStripeSubscriptions({
                    organisationId,
                });

                if (err) {
                    throw new Error(err);
                }

                setSubscriptions(fetched ?? []);
                // Step 3: Cache for 15 minutes (subscription subscriptions update frequently)
                setCookie(cookieKey, JSON.stringify(fetched ?? []), { expires: 15 / (24 * 60) });
            } catch (err) {
                setError(err instanceof Error ? err.message : "Failed to fetch subscription subscriptions");
                setSubscriptions(null);
            } finally {
                setLoading(false);
            }
        },
        [organisationId]
    );

    useEffect(() => {
        fetchSubscriptions();
    }, [fetchSubscriptions]);

    const refetch = useCallback(async () => {
        await fetchSubscriptions({ reload: true });
    }, [fetchSubscriptions]);

    return { subscriptions, loading, error, refetch };
}
