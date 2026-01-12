import { NextRequest, NextResponse } from "next/server";
import { firestoreAdmin } from "@/lib/firebase/config-admin";
import { getInviteCodesPath, getTokensPath } from "@/constants/collections";
import { sendEmail } from "@/services/email/send";
import { inviteTemplate } from "@/templates/email/invite";
import { IEmailTemplate } from "@/models/automation";
import { IMemberInvite } from "@/models/invite";
import { retrieveDomains } from "@/services/firebase/domains/retrieve";

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

/**
 * Replaces template variables with actual values
 */
function replaceTemplateVariables(text: string, variables: Record<string, string>): string {
    let result = text;
    for (const [key, value] of Object.entries(variables)) {
        const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
        result = result.replace(regex, value);
    }
    return result;
}

/**
 * Processes the invite template with the provided variables
 */
function processInviteTemplate(
    organisationName: string,
    inviterName: string,
    role: string,
    inviteUrl: string,
    logoUrl?: string
): IEmailTemplate {
    const variables = {
        organisationName,
        inviterName,
        role: role.charAt(0).toUpperCase() + role.slice(1),
        inviteUrl,
        logoUrl: logoUrl || '',
    };

    const processText = (text: string) => replaceTemplateVariables(text, variables);

    return {
        ...inviteTemplate,
        title: processText(inviteTemplate.title),
        subject: processText(inviteTemplate.subject),
        previewText: processText(inviteTemplate.previewText),
        header: {
            logoUrl: variables.logoUrl,
            headline: processText(inviteTemplate.header.headline),
            subheadline: processText(inviteTemplate.header.subheadline),
        },
        body: {
            greeting: processText(inviteTemplate.body.greeting),
            intro: processText(inviteTemplate.body.intro),
            mainContent: inviteTemplate.body.mainContent.map(content => processText(content)),
            cta: {
                text: processText(inviteTemplate.body.cta.text),
                url: processText(inviteTemplate.body.cta.url),
            },
            secondaryContent: processText(inviteTemplate.body.secondaryContent),
        },
        footer: {
            signOff: processText(inviteTemplate.footer.signOff),
            teamName: processText(inviteTemplate.footer.teamName),
            supportEmail: processText(inviteTemplate.footer.supportEmail),
            address: processText(inviteTemplate.footer.address),
            unsubscribeText: processText(inviteTemplate.footer.unsubscribeText),
        },
        styling: inviteTemplate.styling,
    } as IEmailTemplate;
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
        const { organisationId, inviteId, inviterName, organisationName, baseUrl, logoUrl } = body;

        // Validate required fields
        if (!organisationId) {
            return NextResponse.json(
                { error: 'Missing required field: organisationId' },
                { status: 400 }
            );
        }

        if (!inviteId) {
            return NextResponse.json(
                { error: 'Missing required field: inviteId' },
                { status: 400 }
            );
        }

        if (!inviterName) {
            return NextResponse.json(
                { error: 'Missing required field: inviterName' },
                { status: 400 }
            );
        }

        if (!organisationName) {
            return NextResponse.json(
                { error: 'Missing required field: organisationName' },
                { status: 400 }
            );
        }

        if (!baseUrl) {
            return NextResponse.json(
                { error: 'Missing required field: baseUrl (e.g., https://app.pulse.com)' },
                { status: 400 }
            );
        }

        // Step 1: Validate API key
        const { valid, error: validationError } = await validateApiKey(apiKey, organisationId);
        if (!valid) {
            return NextResponse.json(
                { error: validationError || 'Invalid API key' },
                { status: 401 }
            );
        }

        // Step 2: Retrieve invite code
        const inviteCodesPath = getInviteCodesPath(organisationId);
        const inviteDoc = await firestoreAdmin.collection(inviteCodesPath).doc(inviteId).get();

        if (!inviteDoc.exists) {
            return NextResponse.json(
                { error: 'Invite code not found' },
                { status: 404 }
            );
        }

        const invite = inviteDoc.data() as IMemberInvite;

        // Check if invite has an email
        if (!invite.email) {
            return NextResponse.json(
                { error: 'No email address associated with this invite code' },
                { status: 400 }
            );
        }

        // Step 3: Construct invite URL
        const inviteUrl = `${baseUrl}/sign-up?inviteId=${inviteId}`;

        // Step 4: Process invite template
        const processedTemplate = processInviteTemplate(
            organisationName,
            inviterName,
            invite.role || 'member',
            inviteUrl,
            logoUrl
        );

        // Step 5: Retrieve domains for the organization
        const { domains, error: domainsError } = await retrieveDomains(organisationId);

        if (domainsError || !domains || domains.length === 0) {
            return NextResponse.json(
                { error: domainsError || 'No verified domains found. Please add and verify a domain first.' },
                { status: 404 }
            );
        }

        // Use the first verified domain with email enabled
        const verifiedDomain = domains.find(d => d.verificationStatus === 'verified' && d.emailEnabled);

        if (!verifiedDomain) {
            return NextResponse.json(
                { error: 'No verified domain with email enabled found. Please verify a domain and enable email.' },
                { status: 404 }
            );
        }

        // Step 6: Send email
        const result = await sendEmail({
            domain: verifiedDomain,
            template: processedTemplate,
            to: invite.email,
            customerName: invite.email.split('@')[0], // Use email prefix as name fallback
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
            message: 'Invite email sent successfully',
            messageId: result.messageId,
            to: invite.email,
        });

    } catch (error) {
        console.error('Error in invite-email API:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
