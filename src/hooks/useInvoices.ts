"use client";

// External Imports
import { useState, useEffect, useCallback } from "react";

// Local Imports
import { retrieveStripeInvoices } from "@/services/stripe/retrieve";
import { invoicesCookieKey } from "@/constants/cookies";
import { getSessionStorage, setSessionStorage } from "@/utils/storage-handlers";
import { retrieveAllConnections } from "@/services/connections/retrieve";
import { ICharge } from "@/models/charge";

interface UseInvoicesReturn {
    invoicesByConnection: Record<string, ICharge[]> | null;
    loading: boolean;
    error: string | null;
    refetch: () => Promise<void>;
}

interface UseInvoicesParams {
    organisationId: string | null;
    from?: number; // Unix timestamp in seconds
    to?: number;   // Unix timestamp in seconds
}

export function useInvoices(params: UseInvoicesParams | string | null): UseInvoicesReturn {
    // Support both old API (organisationId as string) and new API (params object)
    const organisationId = typeof params === 'string' || params === null ? params : params.organisationId;
    const from = typeof params === 'object' && params !== null ? params.from : undefined;
    const to = typeof params === 'object' && params !== null ? params.to : undefined;
    const [invoicesByConnection, setInvoicesByConnection] = useState<Record<string, ICharge[]> | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const fetchInvoices = useCallback(
        async ({ reload = false } = {}) => {
            if (!organisationId) {
                setInvoicesByConnection(null);
                setError("No organisation ID provided");
                return;
            }

            setLoading(true);
            setError(null);

            try {
                // Include date range in cache key so different filters have different caches
                const dateRangeSuffix = from !== undefined || to !== undefined
                    ? `_${from !== undefined ? new Date(from * 1000).toISOString().split('T')[0] : 'start'}_${to !== undefined ? new Date(to * 1000).toISOString().split('T')[0] : 'end'}`
                    : '';
                const storageKey = `${organisationId}_${invoicesCookieKey}${dateRangeSuffix}`;

                // Step 1: Try sessionStorage cache
                if (!reload) {
                    const cached = getSessionStorage(storageKey);
                    if (cached) {
                        setInvoicesByConnection(JSON.parse(cached));
                        setLoading(false);
                        return;
                    }
                }

                // Step 2: Fetch all Stripe connections for this organization
                const connections = await retrieveAllConnections({ organisationId });
                const stripeConnections = connections.filter(conn => conn.type === 'stripe' && conn.status === 'connected');

                if (stripeConnections.length === 0) {
                    setInvoicesByConnection({});
                    setLoading(false);
                    return;
                }

                // Step 3: Fetch payments for each Stripe connection
                const invoicesDict: Record<string, ICharge[]> = {};

                await Promise.all(
                    stripeConnections.map(async (connection) => {
                        const { invoices: fetched, error: err } = await retrieveStripeInvoices({
                            organisationId,
                            connectionId: connection.id,
                        });
                        console.log("INV", fetched)

                        if (!err && fetched && connection.entityId) {
                            let filteredFetched = fetched.filter(i => i.customer_email);


                            // Filter by date range if provided
                            if (from !== undefined || to !== undefined) {
                                filteredFetched = filteredFetched.filter(invoice => {
                                    const invoiceTime = invoice.created;
                                    if (from !== undefined && invoiceTime < from) return false;
                                    if (to !== undefined && invoiceTime > to) return false;
                                    return true;
                                });
                            }

                            // Transform Stripe.Invoice to ICharge
                            const charges: ICharge[] = filteredFetched.map(invoice => ({
                                id: invoice.id,
                                type: "recurring" as const,
                                entityId: connection.entityId as string,
                                status: invoice.status === "paid" ? "successful" :
                                    invoice.status === "open" ? "pending" :
                                        invoice.status === "void" ? "failed" : "failed",
                                amount: (invoice.amount_paid || invoice.amount_due || 0) / 100, // Convert from cents to dollars
                                currency: invoice.currency.toUpperCase(),
                                email: invoice.customer_email || "",
                                description: invoice.description || "",
                                receipt_url: invoice.hosted_invoice_url || undefined,
                                createdAt: new Date(invoice.created * 1000).toISOString(),
                            }));
                            invoicesDict[connection.id] = charges;
                        }
                    })
                );

                setInvoicesByConnection(invoicesDict ?? []);
                // Step 4: Cache in sessionStorage (persists for the session)
                setSessionStorage(storageKey, JSON.stringify(invoicesDict ?? []));
            } catch (err) {
                setError(err instanceof Error ? err.message : "Failed to fetch subscription sinvoices");
                setInvoicesByConnection(null);
            } finally {
                setLoading(false);
            }
        },
        [organisationId, from, to]
    );

    useEffect(() => {
        fetchInvoices();
    }, [fetchInvoices]);

    const refetch = useCallback(async () => {
        await fetchInvoices({ reload: true });
    }, [fetchInvoices]);

    return { invoicesByConnection, loading, error, refetch };
}
