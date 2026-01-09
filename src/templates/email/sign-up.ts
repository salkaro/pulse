export const template1 = {
    id: "welcome_signup_v1",

    title: "Welcome to {{entityName}} 👋",

    subject: "Welcome to {{entityName}} – Let’s get started",

    previewText: "Thanks for signing up! Your account is ready.",

    description: "Sent to users immediately after they sign up.",

    header: {
        logoUrl: "{{logoUrl}}",
        headline: "Welcome to {{entityName}}",
        subheadline: "We’re excited to have you on board"
    },

    body: {
        greeting: "Hi {{firstName}},",

        intro:
            "Thanks for creating an account with {{entityName}}. You’re all set and ready to get started.",

        mainContent: [
            "With {{entityName}}, you can:",
            "• Feature one that provides value",
            "• Feature two that saves time",
            "• Feature three that improves results"
        ],

        cta: {
            text: "Get Started",
            url: "{{dashboardUrl}}"
        },

        secondaryContent:
            "If you have any questions, feel free to reply to this email or check out our help center."
    },

    footer: {
        signOff: "Cheers,",
        teamName: "{{entityName}}",

        supportEmail: "support@{{entityDomain}}",

        address: "{{companyAddress}}",

        unsubscribeText:
            "You’re receiving this email because you signed up for {{entityName}}."
    },

    styling: {
        theme: "light",
        primaryColor: "#4F46E5",
        backgroundColor: "#FFFFFF",
        fontFamily: "Inter, Arial, sans-serif"
    }
};
