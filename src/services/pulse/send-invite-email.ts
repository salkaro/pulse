interface SendInviteEmailParams {
    organisationId: string;
    inviteId: string;
    inviterName: string;
    organisationName: string;
    baseUrl: string;
    logoUrl?: string;
    apiKey: string;
}

interface SendInviteEmailResponse {
    success: boolean;
    message?: string;
    messageId?: string;
    to?: string;
    error?: string;
}

/**
 * Sends an invite email via the Pulse API
 */
export async function sendInviteEmail({
    organisationId,
    inviteId,
    inviterName,
    organisationName,
    baseUrl,
    logoUrl,
    apiKey,
}: SendInviteEmailParams): Promise<SendInviteEmailResponse> {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/services/invite-email`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': apiKey,
            },
            body: JSON.stringify({
                organisationId,
                inviteId,
                inviterName,
                organisationName,
                baseUrl,
                logoUrl,
            }),
        });

        const data = await response.json();

        if (!response.ok) {
            return {
                success: false,
                error: data.error || 'Failed to send invite email',
            };
        }

        return {
            success: true,
            message: data.message,
            messageId: data.messageId,
            to: data.to,
        };
    } catch (error) {
        console.error('Error sending invite email:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to send invite email',
        };
    }
}
