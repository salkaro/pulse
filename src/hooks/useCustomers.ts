"use client";

// External Imports
import { useState, useEffect, useCallback } from "react";

// Local Imports
import { retrieveStripeCustomers } from "@/services/stripe/retrieve";
import { customersCookieKey } from "@/constants/cookies";
import { getSessionStorage, setSessionStorage } from "@/utils/storage-handlers";
import { ICustomer } from "@/models/customer";

interface UseCustomersReturn {
    customers: ICustomer[] | null;
    loading: boolean;
    loadingMore: boolean;
    error: string | null;
    refetch: () => Promise<void>;
    loadMore: () => Promise<void>;
    hasMore: boolean;
}

export function useCustomers(organisationId: string | null): UseCustomersReturn {
    const [customers, setCustomers] = useState<ICustomer[] | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [loadingMore, setLoadingMore] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [hasMore, setHasMore] = useState<boolean>(false);

    const fetchCustomers = useCallback(
        async ({ reload = false } = {}) => {
            if (!organisationId) {
                setCustomers(null);
                setError("No organisation ID provided");
                return;
            }

            setLoading(true);
            setError(null);

            try {
                const storageKey = `${organisationId}_${customersCookieKey}`;

                // Step 1: Try sessionStorage cache
                if (!reload) {
                    const cached = getSessionStorage(storageKey);
                    if (cached) {
                        setCustomers(JSON.parse(cached));
                        setLoading(false);
                        return;
                    }
                }

                // Step 2: Fetch first 100 from Stripe
                const { customers: fetched, hasMore: more, error: err } = await retrieveStripeCustomers({
                    organisationId,
                });

                if (err) {
                    throw new Error(err);
                }

                setCustomers(fetched ?? []);
                setHasMore(more);
                // Step 3: Cache in sessionStorage (persists for the session)
                setSessionStorage(storageKey, JSON.stringify(fetched ?? []));
            } catch (err) {
                setError(err instanceof Error ? err.message : "Failed to fetch customers");
                setCustomers(null);
            } finally {
                setLoading(false);
            }
        },
        [organisationId]
    );

    const loadMore = useCallback(async () => {
        if (!organisationId || !customers || customers.length === 0 || !hasMore) return;

        setLoadingMore(true);
        setError(null);

        try {
            const lastCustomerId = customers[customers.length - 1].id;
            const { customers: fetched, hasMore: more, error: err } = await retrieveStripeCustomers({
                organisationId,
                startingAfter: lastCustomerId,
            });

            if (err) {
                throw new Error(err);
            }

            const updated = [...customers, ...(fetched ?? [])];
            setCustomers(updated);
            setHasMore(more);

            // Update cache
            const storageKey = `${organisationId}_${customersCookieKey}`;
            setSessionStorage(storageKey, JSON.stringify(updated));
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to load more customers");
        } finally {
            setLoadingMore(false);
        }
    }, [organisationId, customers, hasMore]);

    useEffect(() => {
        fetchCustomers();
    }, [fetchCustomers]);

    // Auto-load more data if hasMore is true
    useEffect(() => {
        if (hasMore && !loading && !loadingMore) {
            loadMore();
        }
    }, [hasMore, loading, loadingMore, loadMore]);

    const refetch = useCallback(async () => {
        await fetchCustomers({ reload: true });
    }, [fetchCustomers]);

    return { customers, loading, loadingMore, error, refetch, loadMore, hasMore };
}
