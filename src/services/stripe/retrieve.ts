"use server";

import Stripe from "stripe";
import { retrieveConnectionByType, retrieveConnection } from "@/services/connections/retrieve";
import { ICustomer } from "@/models/customer";

const LIMIT = 100;

export async function retrieveStripeCustomers({
    organisationId,
    startingAfter,
}: {
    organisationId: string;
    startingAfter?: string;
}): Promise<{ customers: ICustomer[] | null; hasMore: boolean; error: string | null }> {
    try {
        // Get the Stripe connection for this organization
        const connection = await retrieveConnectionByType({
            organisationId: organisationId,
            type: "stripe",
        });

        if (!connection || !connection.accessToken) {
            return {
                customers: null,
                hasMore: false,
                error: "No Stripe connection found",
            };
        }

        // Initialize Stripe with the connected account's access token
        const stripe = new Stripe(connection.accessToken);

        // Retrieve customers from the connected Stripe account
        const customers = await stripe.customers.list({
            limit: LIMIT,
            starting_after: startingAfter,
        });

        // Map Stripe customers to ICustomer format
        const mappedCustomers: ICustomer[] = customers.data.map((customer) => ({
            id: customer.id,
            name: customer.name || undefined,
            email: customer.email || undefined,
            phone: customer.phone || undefined,
            status: customer.deleted ? "deleted" : "active",
            currency: customer.currency || undefined,
            createdAt: customer.created,
        }));

        return {
            customers: mappedCustomers,
            hasMore: customers.data.length === LIMIT,
            error: null,
        };
    } catch (error) {
        console.error("Error retrieving Stripe customers:", error);
        return {
            customers: null,
            hasMore: false,
            error: error instanceof Error ? error.message : "Failed to retrieve customers",
        };
    }
}

export async function retrieveStripePayments({
    organisationId,
    connectionId,
    startingAfter,
}: {
    organisationId: string;
    connectionId: string;
    startingAfter?: string;
}): Promise<{ payments: Stripe.Charge[] | null; hasMore: boolean; error: string | null }> {
    try {
        // Get the specific Stripe connection by connectionId
        const connection = await retrieveConnection({
            organisationId: organisationId,
            connectionId: connectionId,
        });

        if (!connection || !connection.accessToken) {
            return {
                payments: null,
                hasMore: false,
                error: "No Stripe connection found",
            };
        }

        // Initialize Stripe with the connected account's access token
        const stripe = new Stripe(connection.accessToken);

        // Retrieve charges (payments) from the connected Stripe account
        const charges = await stripe.charges.list({
            limit: LIMIT,
            expand: ['data.customer', 'data.invoice'],
            starting_after: startingAfter,
        });

        return {
            payments: charges.data,
            hasMore: charges.data.length === LIMIT,
            error: null,
        };
    } catch (error) {
        console.error("Error retrieving Stripe payments:", error);
        return {
            payments: null,
            hasMore: false,
            error: error instanceof Error ? error.message : "Failed to retrieve payments",
        };
    }
}

export async function retrieveStripeSubscriptions({
    organisationId,
    startingAfter,
}: {
    organisationId: string;
    startingAfter?: string;
}): Promise<{ subscriptions: Stripe.Subscription[] | null; hasMore: boolean; error: string | null }> {
    try {
        // Get the Stripe connection for this organization
        const connection = await retrieveConnectionByType({
            organisationId: organisationId,
            type: "stripe",
        });

        if (!connection || !connection.accessToken) {
            return {
                subscriptions: null,
                hasMore: false,
                error: "No Stripe connection found",
            };
        }

        // Initialize Stripe with the connected account's access token
        const stripe = new Stripe(connection.accessToken);

        // Retrieve subscriptions
        const subscriptions = await stripe.subscriptions.list({
            limit: LIMIT,
            starting_after: startingAfter,
        });

        return {
            subscriptions: subscriptions.data,
            hasMore: subscriptions.data.length === LIMIT,
            error: null,
        };
    } catch (error) {
        console.error("Error retrieving Stripe subscriptions:", error);
        return {
            subscriptions: null,
            hasMore: false,
            error: error instanceof Error ? error.message : "Failed to retrieve subscriptions",
        };
    }
}

export async function retrieveStripeInvoices({
    organisationId,
    connectionId,
    startingAfter,
}: {
    organisationId: string;
    connectionId: string;
    startingAfter?: string;
}): Promise<{ invoices: Stripe.Invoice[] | null; hasMore: boolean; error: string | null }> {
    try {
        // Get the Stripe connection for this organization
        const connection = await retrieveConnection({
            organisationId: organisationId,
            connectionId: connectionId,
        });

        if (!connection || !connection.accessToken) {
            return {
                invoices: null,
                hasMore: false,
                error: "No Stripe connection found",
            };
        }

        // Initialize Stripe with the connected account's access token
        const stripe = new Stripe(connection.accessToken);

        // Retrieve invoices
        const invoices = await stripe.invoices.list({
            limit: LIMIT,
            starting_after: startingAfter,
        });

        return {
            invoices: invoices.data,
            hasMore: invoices.data.length === LIMIT,
            error: null,
        };
    } catch (error) {
        console.error("Error retrieving Stripe invoices:", error);
        return {
            invoices: null,
            hasMore: false,
            error: error instanceof Error ? error.message : "Failed to retrieve invoices",
        };
    }
}

