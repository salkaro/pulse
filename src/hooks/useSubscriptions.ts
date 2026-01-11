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
    loadingMore: boolean;
    error: string | null;
    refetch: () => Promise<void>;
    loadMore: () => Promise<void>;
    hasMore: boolean;
}

export function useSubscriptions(organisationId: string | null): UseSubscriptionsReturn {
    const [subscriptions, setSubscriptions] = useState<Stripe.Subscription[] | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [loadingMore, setLoadingMore] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [hasMore, setHasMore] = useState<boolean>(false);

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
                const { subscriptions: fetched, hasMore: more, error: err } = await retrieveStripeSubscriptions({
                    organisationId,
                });

                if (err) {
                    throw new Error(err);
                }

                setSubscriptions(fetched ?? []);
                setHasMore(more);
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

    const loadMore = useCallback(async () => {
        if (!organisationId || !subscriptions || subscriptions.length === 0 || !hasMore) return;

        setLoadingMore(true);
        setError(null);

        try {
            const lastSubscriptionId = subscriptions[subscriptions.length - 1].id;
            const { subscriptions: fetched, hasMore: more, error: err } = await retrieveStripeSubscriptions({
                organisationId,
                startingAfter: lastSubscriptionId,
            });

            if (err) {
                throw new Error(err);
            }

            const updated = [...subscriptions, ...(fetched ?? [])];
            setSubscriptions(updated);
            setHasMore(more);

            // Update cache
            const cookieKey = `${organisationId}_${subscriptionsCookieKey}`;
            setCookie(cookieKey, JSON.stringify(updated), { expires: 15 / (24 * 60) });
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to load more subscriptions");
        } finally {
            setLoadingMore(false);
        }
    }, [organisationId, subscriptions, hasMore]);

    useEffect(() => {
        fetchSubscriptions();
    }, [fetchSubscriptions]);

    // Auto-load more data if hasMore is true
    useEffect(() => {
        if (hasMore && !loading && !loadingMore) {
            loadMore();
        }
    }, [hasMore, loading, loadingMore, loadMore]);

    const refetch = useCallback(async () => {
        await fetchSubscriptions({ reload: true });
    }, [fetchSubscriptions]);

    return { subscriptions, loading, loadingMore, error, refetch, loadMore, hasMore };
}
