export type ChargeType = "recurring" | "one-time" | "unknown"
export type ChargeStatus = "successful" | "pending" | "failed" | "refunded";


interface IPaymentMethod {
    brand: string;
    country: string;
    last4: string;
}

interface ICharge {
    id: string;
    type: ChargeType;
    entityId: string;

    status: ChargeStatus;
    amount: number;
    currency: string;
    email: string;

    description: string;
    receipt_url?: string;
    paymentMethods?: IPaymentMethod;

    createdAt: string;
}

export type { ICharge, IPaymentMethod }