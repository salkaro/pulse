"use client";

// External Imports
import { useState, useEffect, useCallback } from "react";

// Local Imports
import { retrieveStripePayments } from "@/services/stripe/retrieve";
import { retrieveAllConnections } from "@/services/connections/retrieve";
import { paymentsCookieKey } from "@/constants/cookies";
import { getSessionStorage, setSessionStorage } from "@/utils/storage-handlers";
import { ICharge } from "@/models/charge";
import Stripe from "stripe";
import { extractOneTimeOrRecurring } from "@/services/stripe/utils";

interface UseChargesReturn {
    chargesByConnection: Record<string, ICharge[]> | null;
    loading: boolean;
    error: string | null;
    refetch: () => Promise<void>;
}

interface UseChargesParams {
    organisationId: string | null;
    from?: number; // Unix timestamp in seconds
    to?: number;   // Unix timestamp in seconds
}

export function useCharges(params: UseChargesParams | string | null): UseChargesReturn {
    // Support both old API (organisationId as string) and new API (params object)
    const organisationId = typeof params === 'string' || params === null ? params : params.organisationId;
    const from = typeof params === 'object' && params !== null ? params.from : undefined;
    const to = typeof params === 'object' && params !== null ? params.to : undefined;
    const [chargesByConnection, setChargesByConnection] = useState<Record<string, ICharge[]> | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const fetchCharges = useCallback(
        async ({ reload = false } = {}) => {
            if (!organisationId) {
                setChargesByConnection(null);
                setError("No organisation ID provided");
                return;
            }

            setLoading(true);
            setError(null);

            try {
                // Include date range in cache key so different filters have different caches
                // Convert timestamps to dates (YYYY-MM-DD) for better cache reuse
                const dateRangeSuffix = from !== undefined || to !== undefined
                    ? `_${from !== undefined ? new Date(from * 1000).toISOString().split('T')[0] : 'start'}_${to !== undefined ? new Date(to * 1000).toISOString().split('T')[0] : 'end'}`
                    : '';
                const cookieKey = `${organisationId}_${paymentsCookieKey}${dateRangeSuffix}`;
                console.log(cookieKey)
                // Step 1: Try sessionStorage cache
                if (!reload) {
                    const cached = getSessionStorage(cookieKey);
                    if (cached) {
                        setChargesByConnection(JSON.parse(cached));
                        setLoading(false);
                        return;
                    }
                }

                // Step 2: Fetch all Stripe connections for this organization
                const connections = await retrieveAllConnections({ organisationId });
                const stripeConnections = connections.filter(conn => conn.type === 'stripe' && conn.status === 'connected');

                if (stripeConnections.length === 0) {
                    setChargesByConnection({});
                    setLoading(false);
                    return;
                }

                // Step 3: Fetch payments for each Stripe connection
                const chargesDict: Record<string, ICharge[]> = {};

                await Promise.all(
                    stripeConnections.map(async (connection) => {
                        const { payments: fetched, error: err } = await retrieveStripePayments({
                            organisationId,
                            connectionId: connection.id,
                        });

                        if (!err && fetched && connection.entityId) {
                            let filteredFetched = fetched;
                            // Filter by date range if provided
                            if (from !== undefined || to !== undefined) {
                                filteredFetched = filteredFetched.filter(charge => {
                                    const chargeTime = charge.created;
                                    if (from !== undefined && chargeTime < from) return false;
                                    if (to !== undefined && chargeTime > to) return false;
                                    return true;
                                });
                            }

                            // Transform Stripe.Charge to ICharge
                            const charges: ICharge[] = filteredFetched.map(charge => ({
                                id: charge.id,
                                type: extractOneTimeOrRecurring(charge.receipt_url as string),
                                entityId: connection.entityId as string,
                                status: charge.status === "succeeded" ? "successful" :
                                    charge.refunded ? "refunded" :
                                        charge.status === "pending" ? "pending" : "failed",
                                amount: charge.amount / 100, // Convert from cents to dollars
                                currency: charge.currency.toUpperCase(),
                                email: (charge.customer as Stripe.Customer)?.email || "",
                                description: charge.description || "",
                                receipt_url: charge.receipt_url || undefined,
                                paymentMethods: {
                                    brand: charge.payment_method_details?.card?.brand || "",
                                    country: charge.payment_method_details?.card?.country || "",
                                    last4: charge.payment_method_details?.card?.last4 || "",
                                },
                                createdAt: new Date(charge.created * 1000).toISOString(),
                            }));
                            chargesDict[connection.id] = charges;
                        }
                    })
                );

                setChargesByConnection(chargesDict);
                // Step 4: Cache in sessionStorage (persists for the session)
                console.log("caching to sessionStorage", cookieKey, "data length:", JSON.stringify(chargesDict).length)
                setSessionStorage(cookieKey, JSON.stringify(chargesDict));

                // Verify storage was set
                const verify = getSessionStorage(cookieKey);
                console.log("SessionStorage set successfully?", verify !== null, "Expected length:", JSON.stringify(chargesDict).length, "Actual length:", verify?.length ?? 0);
            } catch (err) {
                setError(err instanceof Error ? err.message : "Failed to fetch charges");
                setChargesByConnection(null);
            } finally {
                setLoading(false);
            }
        },
        [organisationId, from, to]
    );

    useEffect(() => {
        fetchCharges();
    }, [fetchCharges]);

    const refetch = useCallback(async () => {
        await fetchCharges({ reload: true });
    }, [fetchCharges]);

    return { chargesByConnection, loading, error, refetch };
}
