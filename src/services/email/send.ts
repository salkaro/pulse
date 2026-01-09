"use server";

import nodemailer from 'nodemailer';
import { IDomain } from '@/models/domain';
import { IEmailTemplate } from '@/models/automation';

interface SendEmailOptions {
    domain: IDomain;
    template: IEmailTemplate;
    to: string;
    customerName: string;
}

/**
 * Generates HTML email from email template
 */
function generateEmailHTML(template: IEmailTemplate): string {
    const { header, body, footer, styling } = template;

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${template.title}</title>
    ${header.logoUrl ? `
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": "${footer.teamName}",
      "logo": "${header.logoUrl}"
    }
    </script>
    ` : ''}
</head>
<body style="margin: 0; padding: 0; font-family: ${styling.fontFamily}; background-color: ${styling.backgroundColor};">
    <table role="presentation" style="width: 100%; border-collapse: collapse;">
        <tr>
            <td align="center" style="padding: 40px 0;">
                <table role="presentation" style="width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; overflow: hidden;">
                    <!-- Header -->
                    <tr>
                        <td style="padding: 40px 40px 20px; text-align: center; border-bottom: 1px solid #e5e7eb;">
                            ${header.logoUrl ? `<img src="${header.logoUrl}" alt="Logo" style="width: 64px; height: 64px; border-radius: 50%; object-fit: cover; margin-bottom: 16px;">` : ''}
                            <h1 style="margin: 0 0 8px; font-size: 28px; font-weight: bold; color: ${styling.primaryColor};">
                                ${header.headline}
                            </h1>
                            ${header.subheadline ? `<p style="margin: 0; color: #6b7280; font-size: 14px;">${header.subheadline}</p>` : ''}
                        </td>
                    </tr>

                    <!-- Body -->
                    <tr>
                        <td style="padding: 40px;">
                            <p style="margin: 0 0 16px; font-weight: 500; color: #111827;">
                                ${body.greeting}
                            </p>

                            <p style="margin: 0 0 16px; font-size: 14px; line-height: 1.6; color: #374151;">
                                ${body.intro}
                            </p>

                            ${body.mainContent && body.mainContent.length > 0 ? `
                            <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f9fafb; border-radius: 8px; margin: 16px 0;">
                                <tr>
                                    <td style="padding: 20px;">
                                        ${body.mainContent[0] ? `<p style="margin: 0 0 12px; font-size: 14px; font-weight: 500; color: #111827;">${body.mainContent[0]}</p>` : ''}
                                        ${body.mainContent.slice(1).map(feature => `<p style="margin: 0 0 10px; padding-left: 4px; padding-top: 4px; font-size: 14px; color: #374151;">• ${feature}</p>`).join('')}
                                    </td>
                                </tr>
                            </table>
                            ` : ''}

                            ${body.cta ? `
                            <table role="presentation" style="width: 100%; border-collapse: collapse; margin: 24px 0;">
                                <tr>
                                    <td align="center">
                                        <a href="${body.cta.url}" style="display: inline-block; padding: 12px 32px; background-color: ${styling.primaryColor}; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 500;">
                                            ${body.cta.text}
                                        </a>
                                    </td>
                                </tr>
                            </table>
                            ` : ''}

                            ${body.secondaryContent ? `
                            <p style="margin: 16px 0 0; font-size: 14px; line-height: 1.6; color: #6b7280;">
                                ${body.secondaryContent}
                            </p>
                            ` : ''}
                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td style="padding: 24px 40px; border-top: 1px solid #e5e7eb; text-align: center;">
                            ${footer.signOff ? `<p style="margin: 0 0 4px; font-size: 14px; color: #374151;">${footer.signOff}</p>` : ''}
                            ${footer.teamName ? `<p style="margin: 0 0 16px; font-size: 14px; font-weight: 500; color: #111827;">${footer.teamName}</p>` : ''}
                            ${footer.unsubscribeText ? `<p style="margin: 16px 0 0; font-size: 12px; color: #9ca3af;">${footer.unsubscribeText}</p>` : ''}
                            ${footer.address ? `<p style="margin: 4px 0 0; font-size: 12px; color: #9ca3af;">${footer.address}</p>` : ''}
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
    `.trim();
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
 * Replaces all template variables in the email template
 */
function processTemplate(template: IEmailTemplate, customerName: string): IEmailTemplate {
    const variables = {
        firstName: customerName,
    };

    const processText = (text: string | undefined) =>
        text ? replaceTemplateVariables(text, variables) : text;

    return {
        ...template,
        title: processText(template.title) || template.title,
        subject: processText(template.subject) || template.subject,
        header: {
            ...template.header,
            headline: processText(template.header.headline) || template.header.headline,
            subheadline: processText(template.header.subheadline) || template.header.subheadline,
        },
        body: {
            ...template.body,
            greeting: processText(template.body.greeting) || template.body.greeting,
            intro: processText(template.body.intro) || template.body.intro,
            mainContent: template.body.mainContent.map(content => processText(content) || content),
            secondaryContent: processText(template.body.secondaryContent) || template.body.secondaryContent,
        },
        footer: {
            ...template.footer,
            teamName: processText(template.footer.teamName) || template.footer.teamName,
            unsubscribeText: processText(template.footer.unsubscribeText) || template.footer.unsubscribeText,
        },
    };
}

/**
 * Sends an email using SMTP with DKIM signing
 */
export async function sendEmail({
    domain,
    template,
    to,
    customerName,
}: SendEmailOptions): Promise<{ success: boolean; error?: string; messageId?: string }> {
    try {
        // Validate domain is verified and email enabled
        if (domain.verificationStatus !== 'verified') {
            return { success: false, error: 'Domain is not verified' };
        }

        if (!domain.emailEnabled) {
            return { success: false, error: 'Email is not enabled for this domain' };
        }

        // Process template with customer name
        const processedTemplate = processTemplate(template, customerName);

        // Generate HTML email
        const htmlContent = generateEmailHTML(processedTemplate);

        // Create SMTP transporter
        // Note: You'll need to configure SMTP settings based on your email provider
        // This is a generic configuration that needs to be adapted
        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST || 'smtp.zoho.eu',
            port: parseInt(process.env.SMTP_PORT || '465'),
            secure: process.env.SMTP_SECURE !== 'false', // Default to true for port 465
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });

        // Prepare email headers
        // Use SMTP_USER as the sender to avoid relay errors
        const fromName = processedTemplate.footer.teamName || 'Support';
        const fromEmail = process.env.SMTP_USER || processedTemplate.footer.supportEmail;
        const replyToEmail = processedTemplate.footer.supportEmail;
        const subject = processedTemplate.subject;

        // For centralized sending (Option A), let Zoho handle DKIM automatically
        // Zoho will sign emails with salkaro.com DKIM, which matches the sender domain
        // Using a different domain's DKIM signature would cause validation failures

        // Send email (Zoho adds DKIM signature automatically)
        const info = await transporter.sendMail({
            from: `${fromName} <${fromEmail}>`,
            replyTo: replyToEmail,
            to: to,
            subject: subject,
            html: htmlContent,
            text: processedTemplate.previewText || undefined,
        });

        return {
            success: true,
            messageId: info.messageId,
        };
    } catch (error) {
        console.error('Error sending email:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to send email',
        };
    }
}
