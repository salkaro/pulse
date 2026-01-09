import { ICharge } from "@/models/charge";
import { ICustomer } from "@/models/customer";
import { IEntity } from "@/models/entity";

export function extractInitials({ name, email }: { name?: string | null, email?: string | null }) {
    // If name provided
    if (name) {
        if (name.includes('@')) {
            return name.slice(0, 2).toUpperCase();
        }
        const parts = name.split(' ');
        if (parts.length >= 2) {
            return `${parts[0].charAt(0)}${parts[1].charAt(0)}`.toUpperCase();
        }
        return name.slice(0, 2).toUpperCase();
    }

    if (email) {
        return email.slice(0, 2).toUpperCase();
    }
    return '??';
};


export function extractEntityById(entities?: IEntity[] | null, entityId?: string) {
    if (!entityId) return undefined
    return entities?.find(e => e.id === entityId)
}


export function extractChargeStatus(charge: ICharge) {
    if (charge.status === 'refunded') return { label: 'Refunded', color: '#f97316' };
    if (charge.status === 'successful') return { label: 'Successful', color: '#10b981' };
    if (charge.status === 'pending') return { label: 'Pending', color: '#3b82f6' };
    if (charge.status === 'failed') return { label: 'Failed', color: '#ef4444' };
    return { label: charge.status, color: '#6b7280' };
};

export function extractRoleBadgeVariant(role?: string | null): "default" | "secondary" | "destructive" | "outline" {
    switch (role) {
        case 'admin':
            return 'destructive';
        case 'developer':
            return 'default';
        case 'viewer':
            return 'secondary';
        default:
            return 'outline';
    }
}

export function extractCustomerStatus(customer: ICustomer) {
    if (customer.deleted || customer.status === 'deleted') return { label: 'Deleted', color: '#ef4444' };
    if (customer.status === 'active') return { label: 'Active', color: '#10b981' };
    return { label: 'Active', color: '#10b981' };
}

export function extractNameForProvider(type: string) {
    switch (type) {
        case 'stripe':
            return 'Stripe';
        case 'google':
            return 'Google';
        default:
            return type.charAt(0).toUpperCase() + type.slice(1);
    }
};


export function extractDescriptionForProvider(type: string) {
    switch (type) {
        case 'stripe':
            return 'Connect your Stripe account to monitor payments, customers, disputes and more';
        case 'google':
            return 'Connect your Google account for google analytics';
        default:
            return `Connect your ${type} account`;
    }
}