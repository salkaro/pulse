import { retrieveIdToken } from "@/services/firebase/retrieve";
import { removeCookie } from "./cookie-handlers";
import { idTokenCache } from "@/constants/cache";

/**
 * Wrapper function that handles token expiration automatically.
 * If a server call fails due to an expired token, it will:
 * 1. Refresh the token
 * 2. Retry the operation with the fresh token
 *
 * @param operation - Async function that takes an idToken and performs a server operation
 * @returns The result of the operation
 * @throws Error if the operation fails after retry
 */
export async function withTokenRefresh<T>(
    operation: (idToken: string) => Promise<T>
): Promise<T> {
    try {
        // First attempt: use cached token
        const idToken = await retrieveIdToken();
        if (!idToken) {
            throw new Error("No authentication token available");
        }

        return await operation(idToken);
    } catch (error) {
        // Check if error is related to token expiration
        const errorMessage = error instanceof Error ? error.message : String(error);
        const isTokenExpired =
            errorMessage.includes("auth/id-token-expired") ||
            errorMessage.includes("token has expired") ||
            errorMessage.includes("Token expired");

        if (isTokenExpired) {
            console.log("Token expired, refreshing and retrying...");

            // Clear the expired cached token
            removeCookie(idTokenCache);

            // Get a fresh token (force refresh)
            const freshToken = await retrieveIdToken(true);
            if (!freshToken) {
                throw new Error("Failed to refresh authentication token");
            }

            // Retry the operation with fresh token
            return await operation(freshToken);
        }

        // If not a token error, re-throw the original error
        throw error;
    }
}
