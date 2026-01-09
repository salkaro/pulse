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
    error: string | null;
    refetch: () => Promise<void>;
}

export function useCustomers(organisationId: string | null): UseCustomersReturn {
    const [customers, setCustomers] = useState<ICustomer[] | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

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

                // Step 2: Fetch from Stripe via backend
                const { customers: fetched, error: err } = await retrieveStripeCustomers({
                    organisationId,
                });

                if (err) {
                    throw new Error(err);
                }

                setCustomers(fetched ?? []);
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

    useEffect(() => {
        fetchCustomers();
    }, [fetchCustomers]);

    const refetch = useCallback(async () => {
        await fetchCustomers({ reload: true });
    }, [fetchCustomers]);

    return { customers, loading, error, refetch };
}
