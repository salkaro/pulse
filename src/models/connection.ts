export type ConnectionType = "stripe" | "google";
export type ConnectionStatus = "connected" | "disconnected" | "error";

export interface IConnection {
    id: string;
    organisationId: string;
    productId?: string;
    type: ConnectionType;
    status: ConnectionStatus;

    // Entity attachment
    entityId?: string;
    entityName?: string;

    // OAuth tokens (encrypted)
    accessToken?: string;
    refreshToken?: string;

    // Stripe-specific data
    stripeAccountId?: string;

    // Google-specific data
    googleEmail?: string;

    // Metadata
    connectedAt?: number;
    lastSyncedAt?: number;
    expiresAt?: number;

    // Error tracking
    error?: string;
}

export interface IStripeOAuthToken {
    access_token: string;
    refresh_token?: string;
    token_type: string;
    stripe_publishable_key: string;
    stripe_user_id: string;
    scope: string;
}
