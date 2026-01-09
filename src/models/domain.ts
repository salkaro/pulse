export type DomainVerificationStatus = "pending" | "verified" | "failed"
export type DNSRecordType = "TXT" | "CNAME" | "MX"

export interface IDNSRecord {
    type: DNSRecordType
    name: string
    value: string
    priority?: number
    purpose: "ownership" | "dkim" | "spf" | "dmarc" | "mx"
    verified: boolean
}

export interface IDomain {
    id: string
    domain: string
    organisationId: string

    // Verification
    verificationStatus: DomainVerificationStatus
    verificationToken: string
    verifiedAt?: number
    lastVerificationAttempt?: number

    // DNS Records for email authentication
    dnsRecords: IDNSRecord[]

    // Email configuration
    emailEnabled: boolean
    dkimSelector: string
    dkimPrivateKey: string
    dkimPublicKey: string

    // Metadata
    createdAt: number
    updatedAt: number
    createdBy: string
}

export interface ICreateDomainInput {
    domain: string
    organisationId: string
    createdBy: string
}
