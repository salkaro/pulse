"use server";

interface SendWelcomeEmailParams {
    customerEmail: string;
    customerName: string;
}

interface SendWelcomeEmailResponse {
    success: boolean;
    error?: string;
    messageId?: string;
}

/**
 * Sends a welcome email to a new user via the Pulse API
 */
export async function sendWelcomeEmail({
    customerEmail,
    customerName,
}: SendWelcomeEmailParams): Promise<SendWelcomeEmailResponse> {
    try {
        const apiKey = process.env.PULSE_API_KEY;
        const apiUrl = process.env.PULSE_API_URL;
        const organisationId = process.env.PULSE_ORGANISATION_ID;
        const entityId = process.env.PULSE_ENTITY_ID;

        // Validate environment variables
        if (!apiKey) {
            console.error('PULSE_API_KEY is not configured');
            return { success: false, error: 'Email service not configured' };
        }

        if (!apiUrl) {
            console.error('PULSE_API_URL is not configured');
            return { success: false, error: 'Email service not configured' };
        }

        if (!organisationId) {
            console.error('PULSE_ORGANISATION_ID is not configured');
            return { success: false, error: 'Email service not configured' };
        }

        if (!entityId) {
            console.error('PULSE_ENTITY_ID is not configured');
            return { success: false, error: 'Email service not configured' };
        }

        // Make request to Pulse API
        const response = await fetch(`${apiUrl}/api/services/welcome-mail`, {
            method: 'POST',
            headers: {
                'x-api-key': apiKey,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                organisationId,
                entityId,
                customerEmail,
                customerName,
            }),
        });

        const data = await response.json();

        if (!response.ok) {
            console.error('Pulse API error:', data);
            return {
                success: false,
                error: data.error || 'Failed to send welcome email',
            };
        }

        return {
            success: true,
            messageId: data.messageId,
        };
    } catch (error) {
        console.error('Error sending welcome email:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to send welcome email',
        };
    }
}
