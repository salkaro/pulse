"use server";

import Stripe from "stripe";
import { retrieveConnectionByType, retrieveConnection } from "@/services/connections/retrieve";
import { ICustomer } from "@/models/customer";

export async function retrieveStripeCustomers({
    organisationId,
}: {
    organisationId: string;
}): Promise<{ customers: ICustomer[] | null; error: string | null }> {
    try {
        // Get the Stripe connection for this organization
        const connection = await retrieveConnectionByType({
            organisationId: organisationId,
            type: "stripe",
        });

        if (!connection || !connection.accessToken) {
            return {
                customers: null,
                error: "No Stripe connection found",
            };
        }

        // Initialize Stripe with the connected account's access token
        const stripe = new Stripe(connection.accessToken);

        // Retrieve all customers from the connected Stripe account
        const customers = await stripe.customers.list({
            limit: 100, // Adjust as needed
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
            error: null,
        };
    } catch (error) {
        console.error("Error retrieving Stripe customers:", error);
        return {
            customers: null,
            error: error instanceof Error ? error.message : "Failed to retrieve customers",
        };
    }
}

export async function retrieveStripePayments({
    organisationId,
    connectionId,
}: {
    organisationId: string;
    connectionId: string;
}): Promise<{ payments: Stripe.Charge[] | null; error: string | null }> {
    try {
        // Get the specific Stripe connection by connectionId
        const connection = await retrieveConnection({
            organisationId: organisationId,
            connectionId: connectionId,
        });

        if (!connection || !connection.accessToken) {
            return {
                payments: null,
                error: "No Stripe connection found",
            };
        }

        // Initialize Stripe with the connected account's access token
        const stripe = new Stripe(connection.accessToken);

        // Retrieve all charges (payments) from the connected Stripe account
        const charges = await stripe.charges.list({
            limit: 100,
            expand: ['data.customer', 'data.invoice'],
        });

        return {
            payments: charges.data,
            error: null,
        };
    } catch (error) {
        console.error("Error retrieving Stripe payments:", error);
        return {
            payments: null,
            error: error instanceof Error ? error.message : "Failed to retrieve payments",
        };
    }
}

export async function retrieveStripeSubscriptions({
    organisationId,
}: {
    organisationId: string;
}): Promise<{ subscriptions: Stripe.Subscription[] | null; error: string | null }> {
    try {
        // Get the Stripe connection for this organization
        const connection = await retrieveConnectionByType({
            organisationId: organisationId,
            type: "stripe",
        });

        if (!connection || !connection.accessToken) {
            return {
                subscriptions: null,
                error: "No Stripe connection found",
            };
        }

        // Initialize Stripe with the connected account's access token
        const stripe = new Stripe(connection.accessToken);

        // Retrieve all active subscriptions
        const subscriptions = await stripe.subscriptions.list({ limit: 100 });

        return {
            subscriptions: subscriptions.data,
            error: null,
        };
    } catch (error) {
        console.error("Error retrieving Stripe subscriptions:", error);
        return {
            subscriptions: null,
            error: error instanceof Error ? error.message : "Failed to retrieve subscriptions",
        };
    }
}

export async function retrieveStripeInvoices({
    organisationId,
    connectionId,
}: {
    organisationId: string;
    connectionId: string;
}): Promise<{ invoices: Stripe.Invoice[] | null; error: string | null }> {
    try {
        // Get the Stripe connection for this organization
        const connection = await retrieveConnection({
            organisationId: organisationId,
            connectionId: connectionId,
        });

        if (!connection || !connection.accessToken) {
            return {
                invoices: null,
                error: "No Stripe connection found",
            };
        }

        // Initialize Stripe with the connected account's access token
        const stripe = new Stripe(connection.accessToken);

        // Retrieve all active subscriptions
        const invoices = await stripe.invoices.list({
            limit: 100
        });

        return {
            invoices: invoices.data,
            error: null,
        };
    } catch (error) {
        console.error("Error retrieving Stripe invoices:", error);
        return {
            invoices: null,
            error: error instanceof Error ? error.message : "Failed to retrieve invoices",
        };
    }
}

