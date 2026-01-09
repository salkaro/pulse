import { OrgRoleType } from "@/constants/access";

export type EmailVerification = "unverified" | "verifying" | "verified";


interface IUser {
    id: string;
    email: string;

    // Details
    firstname?: string;
    lastname?: string;
    
    organisation?: IUserOrganisation;

    brand?: IBrand;
    authentication?: IAuthentication | null;
    metadata?: IMetaData;
}


interface IBrand {
    imageUrl?: string | null;
}

interface IUserOrganisation {
    id?: string | null;
    role?: OrgRoleType | null;
    joinedAt?: number | null;
}

interface IAuthentication {
    emailVerified?: EmailVerification;
    onboarding?: boolean | null;
}


interface IMetaData {
    createdAt?: number | null;
}


export type { IUser, IUserOrganisation }