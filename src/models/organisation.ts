import { CurrencyCode } from "@/constants/currencies";
import { memberLimits } from "@/constants/limits";

export type SubscriptionType = keyof typeof memberLimits;

interface IOrganisation {
    id: string;
    name?: string | null;
    stripeCustomerId?: string | null;
    currency?: CurrencyCode;

    subscription?: SubscriptionType | null;
    members?: number | null;
    entities?: number | null;

    brand?: IBrand;
    ownerId?: string | null;
    createdAt: number;
}

interface IBrand {
    imageUrl?: string | null;
}

export type { IOrganisation }