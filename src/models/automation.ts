

export type AutomationType = "email-on-sign-up"

interface IAutomation {
    id: string;
    type: AutomationType;

    entityId: string;
    emailTemplate?: IEmailTemplate;

    lastUsed?: number;
    createdAt: number;
}

interface IEmailTemplate {
    id: string;
    title: string;
    subject: string;
    previewText: string;
    description: string;
    header: {
        logoUrl: string;
        headline: string;
        subheadline: string;
    }
    body: {
        greeting: string;
        intro: string;
        mainContent: string[];
        cta: {
            text: string;
            url: string;
        }
        secondaryContent: string;
    },
    footer: {
        signOff: string;
        teamName: string;
        supportEmail: string;
        address: string;
        unsubscribeText: string;
    },
    styling: {
        theme: string;
        primaryColor: string;
        backgroundColor: string;
        fontFamily: string;
    }
}

export type { IAutomation, IEmailTemplate }