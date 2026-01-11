import { LayoutGridIcon } from "@/components/icons/icons";
import { AutomationType } from "@/models/automation";
import { LucideIcon, UserRound, Wallet, Store, Table2, FilePlusCorner, UsersRound, ArrowLeftRight, ChartLine, GalleryThumbnails, UserLock, MousePointerClick, Mail, GlobeLock, FileChartPie, PencilRuler, Blend } from "lucide-react";


export interface AutomationOption {
    type: AutomationType;
    name: string;
    description: string;
    icon: LucideIcon;
    color: string;
}


export const automationOptions: AutomationOption[] = [
    {
        type: "email-on-sign-up",
        name: "Email on Sign Up",
        description: "Automatically send a welcome email when a new user signs up",
        icon: Mail,
        color: "text-blue-500"
    }
]

export interface IItem {
    title: string;
    url: string;
    icon: LucideIcon;
    description: string;
    type: "page";
    items?: IItem[];
}

export const sidebarItems = {
    application: [
        {
            title: "Dashboard",
            url: "/dashboard",
            icon: Table2,
            description: "Overview of your companies",
            type: "page" as const
        },
        {
            title: "Payments",
            url: "/payments",
            icon: ArrowLeftRight,
            description: "Overview of payments",
            type: "page" as const
        },
        {
            title: "Tickets",
            url: "/tickets",
            icon: FilePlusCorner,
            description: "Overview of tickets created by customers",
            type: "page" as const
        },
        {
            title: "Customers",
            url: "/customers",
            icon: UsersRound,
            description: "Overview of company customers",
            type: "page" as const
        },
    ] as IItem[],
    implementation: [
        {
            title: "Automations",
            url: "/automations",
            icon: MousePointerClick,
            description: "Overview of automations",
            type: "page" as const
        },
        {
            title: "Analytics",
            url: "/analytics",
            icon: ChartLine,
            description: "Overview website/app analytics",
            type: "page" as const
        },
        {
            title: "Connections",
            url: "/connections",
            icon: LayoutGridIcon,
            description: "Overview of connected apps",
            type: "page" as const
        },
        {
            title: "Brand",
            url: "/brand",
            icon: GalleryThumbnails,
            description: "Overview of brand images, logos, icons, etc",
            type: "page" as const
        },
    ] as IItem[],
    internal: [
        {
            title: "Reports",
            url: "/reports",
            icon: FileChartPie,
            description: "Generate reports",
            type: "page" as const
        },
        {
            title: "Employee Mangement",
            url: "/employee-management",
            icon: UserLock,
            description: "Overview of employees",
            type: "page" as const
        },
        {
            title: "Domains",
            url: "/domains",
            icon: GlobeLock,
            description: "Overview of domains",
            type: "page" as const
        },
        {
            title: "Internal Tools",
            url: "/internal-tools",
            icon: Blend,
            description: "Internal Tools",
            type: "page" as const
        },
    ] as IItem[],
} as const satisfies Record<string, IItem[]>;


export const sidebarFooter = [] as IItem[];


export const settingsSubItems: IItem[] = [
    {
        title: "Overview",
        description: "Edit personal information",
        type: "page",
        url: "/settings#overview",
        icon: UserRound,
    },
    {
        title: "Organisation",
        description: "Edit organisational data & add members",
        type: "page",
        url: "/settings#organisation",
        icon: Store,
    },
    {
        title: "Billing",
        description: "View billing & manage memberships",
        type: "page",
        url: "/settings#billing",
        icon: Wallet,
    },
];