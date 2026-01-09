import { NextRequest, NextResponse } from "next/server";
import { firestoreAdmin } from "@/lib/firebase/config-admin";
import { getAutomationsPath, getTokensPath } from "@/constants/collections";
import { retrieveEntity } from "@/services/firebase/entities/retrieve";
import { retrieveDomains } from "@/services/firebase/domains/retrieve";
import { sendEmail } from "@/services/email/send";
import { IAutomation } from "@/models/automation";

/**
 * Extract base domain from a URL or subdomain
 * Examples:
 * - https://app.example.com -> example.com
 * - https://example.com -> example.com
 * - https://subdomain.example.com -> example.com
 */
function extractBaseDomain(url: string): string | null {
    try {
        const urlObj = new URL(url);
        const hostname = urlObj.hostname;

        // Split by dots
        const parts = hostname.split('.');

        // If we have at least 2 parts (domain.tld), return the last two
        if (parts.length >= 2) {
            return parts.slice(-2).join('.');
        }

        return hostname;
    } catch (error) {
        console.error('Error extracting domain from URL:', error);
        return null;
    }
}

/**
 * Validates API key against organization tokens
 */
async function validateApiKey(
    apiKey: string,
    organisationId: string
): Promise<{ valid: boolean; error?: string }> {
    try {
        // Check if API key ends with "00" (admin access level)
        if (!apiKey.endsWith('00')) {
            return { valid: false, error: 'Invalid API key access level' };
        }

        // Reference to the tokens subcollection
        const tokensPath = getTokensPath(organisationId);
        const tokenDoc = await firestoreAdmin.collection(tokensPath).doc(apiKey).get();

        if (!tokenDoc.exists) {
            return { valid: false, error: 'Invalid API key' };
        }

        return { valid: true };
    } catch (error) {
        console.error('Error validating API key:', error);
        return { valid: false, error: 'Failed to validate API key' };
    }
}

export async function POST(request: NextRequest) {
    try {
        // Extract API key from header
        const apiKey = request.headers.get('x-api-key') || request.headers.get('authorization')?.replace('Bearer ', '');

        if (!apiKey) {
            return NextResponse.json(
                { error: 'Missing API key. Provide x-api-key header or Bearer token' },
                { status: 401 }
            );
        }

        // Parse request body
        const body = await request.json();
        const { entityId, customerEmail, customerName } = body;

        // Validate required fields
        if (!entityId) {
            return NextResponse.json(
                { error: 'Missing required field: entityId' },
                { status: 400 }
            );
        }

        if (!customerEmail) {
            return NextResponse.json(
                { error: 'Missing required field: customerEmail' },
                { status: 400 }
            );
        }

        if (!customerName) {
            return NextResponse.json(
                { error: 'Missing required field: customerName' },
                { status: 400 }
            );
        }

        // Step 1: Retrieve entity to get organizationId
        // We need to find which organization this entity belongs to
        // Since we don't have organizationId in the request, we need to search for it
        // Let's get it from the API key structure or require it in the request

        // For now, let's require organisationId in the request body
        const { organisationId } = body;

        if (!organisationId) {
            return NextResponse.json(
                { error: 'Missing required field: organisationId' },
                { status: 400 }
            );
        }

        // Validate API key
        const { valid, error: validationError } = await validateApiKey(apiKey, organisationId);
        if (!valid) {
            return NextResponse.json(
                { error: validationError || 'Invalid API key' },
                { status: 401 }
            );
        }

        // Step 2: Retrieve entity
        const { entity, error: entityError } = await retrieveEntity({
            organisationId,
            entityId,
        });

        if (entityError || !entity) {
            return NextResponse.json(
                { error: entityError || 'Entity not found' },
                { status: 404 }
            );
        }

        // Step 3: Retrieve email-on-sign-up automation
        const automationsPath = getAutomationsPath(organisationId, entityId);
        const automationsSnapshot = await firestoreAdmin
            .collection(automationsPath)
            .where('type', '==', 'email-on-sign-up')
            .limit(1)
            .get();

        if (automationsSnapshot.empty) {
            return NextResponse.json(
                { error: 'No email-on-sign-up automation found for this entity' },
                { status: 404 }
            );
        }

        const automation = automationsSnapshot.docs[0].data() as IAutomation;

        if (!automation.emailTemplate) {
            return NextResponse.json(
                { error: 'Email template not configured for this automation' },
                { status: 400 }
            );
        }

        // Step 4: Extract domain from body.cta.url
        const dashboardUrl = automation.emailTemplate.body.cta.url;
        const baseDomain = extractBaseDomain(dashboardUrl);

        if (!baseDomain) {
            return NextResponse.json(
                { error: 'Could not extract domain from dashboard URL' },
                { status: 400 }
            );
        }

        // Step 5: Retrieve domain configuration from organization
        const { domains, error: domainsError } = await retrieveDomains(organisationId);

        if (domainsError || !domains) {
            return NextResponse.json(
                { error: domainsError || 'Failed to retrieve domains' },
                { status: 500 }
            );
        }

        // Find matching domain
        const matchingDomain = domains.find(d => d.domain === baseDomain);

        if (!matchingDomain) {
            return NextResponse.json(
                { error: `Domain ${baseDomain} not found in organization. Please add and verify the domain first.` },
                { status: 404 }
            );
        }

        // Step 6: Send email using the domain
        const result = await sendEmail({
            domain: matchingDomain,
            template: automation.emailTemplate,
            to: customerEmail,
            customerName,
        });

        if (!result.success) {
            return NextResponse.json(
                { error: result.error || 'Failed to send email' },
                { status: 500 }
            );
        }

        // Step 7: Return success response
        return NextResponse.json({
            success: true,
            message: 'Welcome email sent successfully',
            messageId: result.messageId,
        });

    } catch (error) {
        console.error('Error in welcome-mail API:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
