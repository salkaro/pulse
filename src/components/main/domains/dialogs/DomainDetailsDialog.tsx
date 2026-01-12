"use client"

import { useState } from 'react'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog"
import { IDomain } from '@/models/domain'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Copy, Check, ShieldCheck, Shield, ShieldAlert, RefreshCw } from 'lucide-react'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { verifyDomain } from '@/services/firebase/domains/verify'
import { removeSessionStorage } from '@/utils/storage-handlers'
import { domainsCookieKey } from '@/constants/cookies'

interface Props {
    open: boolean
    onOpenChange: (open: boolean) => void
    domain: IDomain
    organisationId: string | null
    canEdit?: boolean;
}

const DomainDetailsDialog: React.FC<Props> = ({
    open,
    onOpenChange,
    domain,
    organisationId,
    canEdit
}) => {
    const [copiedRecord, setCopiedRecord] = useState<string | null>(null)
    const [isVerifying, setIsVerifying] = useState(false)

    const handleCopyRecord = (recordName: string, recordValue: string) => {
        const text = `${recordName}\n${recordValue}`
        navigator.clipboard.writeText(text)
        setCopiedRecord(recordName)
        toast.success('DNS record copied to clipboard')
        setTimeout(() => setCopiedRecord(null), 2000)
    }

    const handleVerify = async () => {
        if (!organisationId) return

        setIsVerifying(true)
        try {
            const result = await verifyDomain(organisationId, domain.id)
            if (result.error) {
                toast.error(result.error)
            } else {
                toast.success('Domain verification check completed')
                removeSessionStorage(domainsCookieKey)
                // Update the domain in the parent component by closing and reopening
                onOpenChange(false)
            }
        } catch (error) {
            toast.error('Failed to verify domain')
        } finally {
            setIsVerifying(false)
        }
    }

    const getVerificationBadge = (status: IDomain['verificationStatus']) => {
        switch (status) {
            case 'verified':
                return <Badge variant="default" className="gap-1 bg-green-500/10 text-green-600 hover:bg-green-500/20">
                    <ShieldCheck className="w-3 h-3" />
                    Verified
                </Badge>
            case 'pending':
                return <Badge variant="secondary" className="gap-1">
                    <Shield className="w-3 h-3" />
                    Pending Verification
                </Badge>
            case 'failed':
                return <Badge variant="destructive" className="gap-1">
                    <ShieldAlert className="w-3 h-3" />
                    Verification Failed
                </Badge>
        }
    }

    const getRecordTypeColor = (purpose: string) => {
        switch (purpose) {
            case 'ownership':
                return 'bg-purple-500/10 text-purple-600'
            case 'spf':
                return 'bg-blue-500/10 text-blue-600'
            case 'dkim':
                return 'bg-green-500/10 text-green-600'
            case 'dmarc':
                return 'bg-orange-500/10 text-orange-600'
            case 'mx':
                return 'bg-pink-500/10 text-pink-600'
            default:
                return 'bg-gray-500/10 text-gray-600'
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
                <DialogHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <DialogTitle className="text-2xl">{domain.domain}</DialogTitle>
                            <DialogDescription className="mt-2">
                                DNS configuration and verification status
                            </DialogDescription>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                            {getVerificationBadge(domain.verificationStatus)}
                            <Badge variant={domain.emailEnabled ? "default" : "secondary"} className={domain.emailEnabled ? "bg-blue-500/10 text-blue-600 hover:bg-blue-500/20" : ""}>
                                Email {domain.emailEnabled ? 'Enabled' : 'Disabled'}
                            </Badge>
                        </div>
                    </div>
                </DialogHeader>

                <div className="space-y-6 mt-4">
                    <div className="flex justify-between items-center">
                        <div>
                            <h3 className="text-lg font-semibold">DNS Records</h3>
                            <p className="text-sm text-muted-foreground">
                                Add these records to your DNS provider to verify your domain and enable email sending
                            </p>
                        </div>
                        {!domain.emailEnabled && (
                            <Button
                                onClick={handleVerify}
                                disabled={isVerifying || !canEdit}
                                size="sm"
                            >
                                <RefreshCw className={`w-4 h-4 mr-2 ${isVerifying ? 'animate-spin' : ''}`} />
                                Verify Now
                            </Button>
                        )}
                    </div>

                    <div className="space-y-4">
                        {domain.dnsRecords.map((record, index) => (
                            <Card key={index} className={record.verified ? "border-green-500/50" : ""}>
                                <CardHeader className="pb-3">
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                                            <Badge className={getRecordTypeColor(record.purpose)}>
                                                {record.type}
                                            </Badge>
                                            <span className="text-xs uppercase text-muted-foreground">
                                                {record.purpose}
                                            </span>
                                            {record.verified && (
                                                <Badge variant="default" className="gap-1 bg-green-500/10 text-green-600">
                                                    <Check className="w-3 h-3" />
                                                    Verified
                                                </Badge>
                                            )}
                                        </CardTitle>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleCopyRecord(record.name, record.value)}
                                        >
                                            {copiedRecord === record.name ? (
                                                <Check className="w-4 h-4 text-green-500" />
                                            ) : (
                                                <Copy className="w-4 h-4" />
                                            )}
                                        </Button>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    <div>
                                        <Label className="text-xs text-muted-foreground">Name/Host</Label>
                                        <p className="text-sm font-mono bg-muted p-2 rounded mt-1 break-all">
                                            {record.name}
                                        </p>
                                    </div>
                                    <div>
                                        <Label className="text-xs text-muted-foreground">Value</Label>
                                        <p className="text-sm font-mono bg-muted p-2 rounded mt-1 break-all">
                                            {record.value}
                                        </p>
                                    </div>
                                    {record.priority !== undefined && (
                                        <div>
                                            <Label className="text-xs text-muted-foreground">Priority</Label>
                                            <p className="text-sm font-mono bg-muted p-2 rounded mt-1">
                                                {record.priority}
                                            </p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    {domain.verificationStatus === 'pending' && (
                        <div className="bg-muted p-4 rounded-lg space-y-2">
                            <h4 className="text-sm font-medium">Verification Steps:</h4>
                            <ol className="text-sm space-y-1 list-decimal list-inside text-muted-foreground">
                                <li>Add the DNS records shown above to your domain provider</li>
                                <li>Wait for DNS propagation (usually 5-30 minutes, up to 48 hours)</li>
                                <li>Click the &quot;Verify Now&quot; button above to check verification status</li>
                                <li>Once all records are verified, email sending will be enabled</li>
                            </ol>
                        </div>
                    )}

                    {domain.verificationStatus === 'verified' && !domain.emailEnabled && (
                        <div className="bg-yellow-500/10 border border-yellow-500/50 p-4 rounded-lg">
                            <p className="text-sm text-yellow-700 dark:text-yellow-400">
                                Domain is verified, but some email authentication records are missing.
                                Please verify all DNS records to enable email sending.
                            </p>
                        </div>
                    )}

                    {domain.emailEnabled && (
                        <div className="bg-green-500/10 border border-green-500/50 p-4 rounded-lg">
                            <p className="text-sm text-green-700 dark:text-green-400">
                                Your domain is fully configured and ready to send emails!
                            </p>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}

export default DomainDetailsDialog
