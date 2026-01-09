import { ChargeType } from "@/models/charge"

export function extractOneTimeOrRecurring(receipt_url: string): ChargeType {
    if (!receipt_url) {
        return "unknown"
    }

    try {
        const url = new URL(receipt_url)
        const path = url.pathname

        // Invoice-backed receipt
        // https://pay.stripe.com/receipts/invoices/...
        if (path.startsWith('/receipts/invoices/')) {
            return "recurring"
        }

        // One-off charge receipt
        // https://pay.stripe.com/receipts/payment/...
        if (path.startsWith('/receipts/payment/')) {
            return "one-time"
        }

        return "unknown"
    } catch {
        return "unknown"
    }
}
