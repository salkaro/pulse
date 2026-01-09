interface IEntityConnections {
    stripeConnectionId?: string;
    googleConnectionId?: string;
}

interface IEntity {
    id: string;
    name: string;
    description?: string | null;
    images?: IBrandImages;

    // Connections
    connections?: IEntityConnections;

    // Tickets
    ticketId?: string;

    // Meta
    createdAt: number
    owner?: string | null;
}

export interface IBrandImages {
    /** Primary brand identity */
    logo: {
        primary?: string          // Main logo (light background)
        inverted?: string         // White / inverted logo (dark background)
        icon?: string             // Logo mark / favicon
    }

    /** Profile & avatars */
    profile?: {
        square?: string           // Square avatar (1:1)
        round?: string            // Rounded avatar
        favicon?: string          // Favicon for profile
    }

    /** Marketing & promotional images */
    banners?: {
        hero?: string             // Homepage hero banner
        dashboard?: string        // App/dashboard header
        email?: string            // Email header banner
        social?: string           // Social sharing banner (Open Graph)
    }

    /** Product or brand visuals */
    gallery?: string[]          // General image gallery
    productShots?: string[]    // Product-focused images

    /** Social media */
    social?: {
        avatar?: string
        cover?: string
    }

    /** App & platform icons */
    appIcons?: {
        ios?: string
        android?: string
        web?: string              // PWA icon
        favicon?: string
    }

    /** Store / marketplace images */
    marketplace?: {
        appStore?: string
        playStore?: string
    }

    /** Legal / press */
    pressKit?: {
        logoPack?: string         // Zip or hosted page
        brandGuide?: string       // PDF
    }

    /** Misc / future-proof */
    custom?: Record<string, string>
}

export type { IEntity, IEntityConnections }