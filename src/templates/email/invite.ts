export const inviteTemplate = {
    id: "invite_member_v1",

    title: "You're invited to join {{organisationName}} 👋",

    subject: "You're invited to join {{organisationName}}",

    previewText: "Accept your invitation to join the team.",

    description: "Sent to users when they're invited to join an organization.",

    header: {
        logoUrl: "{{logoUrl}}",
        headline: "You're Invited!",
        subheadline: "Join {{organisationName}} on Pulse"
    },

    body: {
        greeting: "Hi there,",

        intro:
            "{{inviterName}} has invited you to join {{organisationName}} as a {{role}}.",

        mainContent: [
            "By accepting this invitation, you'll be able to:",
            "Collaborate with your team",
            "Access shared resources",
            "Start contributing right away"
        ],

        cta: {
            text: "Accept Invitation",
            url: "{{inviteUrl}}"
        },

        secondaryContent:
            "If you have any questions, feel free to reply to this email or contact support."
    },

    footer: {
        signOff: "Welcome aboard,",
        teamName: "Pulse",

        supportEmail: "support@salkaro.com",

        address: "",

        unsubscribeText:
            "You're receiving this email because someone invited you to join their organization on Pulse."
    },

    styling: {
        theme: "light",
        primaryColor: "#4F46E5",
        backgroundColor: "#FFFFFF",
        fontFamily: "Inter, Arial, sans-serif"
    }
};
