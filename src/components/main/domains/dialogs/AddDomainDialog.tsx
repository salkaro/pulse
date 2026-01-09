"use client"

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { Loader2Icon, Copy, Check, Info } from 'lucide-react'
import { createDomain } from '@/services/firebase/domains/create'
import { removeSessionStorage } from '@/utils/storage-handlers'
import { domainsCookieKey } from '@/constants/cookies'
import { IDomain } from '@/models/domain'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface Props {
    open: boolean
    onOpenChange: (open: boolean) => void
    organisationId: string | null
    userId: string | null
    onDomainCreated?: () => void
}

const AddDomainDialog: React.FC<Props> = ({
    open,
    onOpenChange,
    organisationId,
    userId,
    onDomainCreated
}) => {
    const [domain, setDomain] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [createdDomain, setCreatedDomain] = useState<IDomain | null>(null)
    const [copiedRecord, setCopiedRecord] = useState<string | null>(null)

    const handleCreate = async () => {
        if (!domain || !organisationId || !userId) {
            toast.error("Please enter a domain")
            return
        }

        setIsLoading(true)
        try {
            const result = await createDomain({
                domain,
                organisationId,
                createdBy: userId
            })

            if (result.error) {
                throw new Error(result.error)
            }

            removeSessionStorage(domainsCookieKey)
            toast.success('Domain created successfully')
            setCreatedDomain(result.domain ?? null)
            onDomainCreated?.()
        } catch (error) {
            console.error('Error creating domain:', error)
            toast.error(error instanceof Error ? error.message : 'Failed to create domain')
        } finally {
            setIsLoading(false)
        }
    }

    const handleCopyRecord = (recordName: string, recordValue: string) => {
        const text = `${recordName}\n${recordValue}`
        navigator.clipboard.writeText(text)
        setCopiedRecord(recordName)
        toast.success('DNS record copied to clipboard')
        setTimeout(() => setCopiedRecord(null), 2000)
    }

    const handleClose = () => {
        onOpenChange(false)
        setDomain('')
        setCreatedDomain(null)
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
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className={createdDomain ? "max-w-2xl!" : "max-w-md"}>
                <DialogHeader>
                    <DialogTitle>
                        {createdDomain ? 'Configure DNS Records' : 'Add New Domain'}
                    </DialogTitle>
                    <DialogDescription>
                        {createdDomain
                            ? 'Add these DNS records to your domain to verify ownership and enable email sending'
                            : 'Enter the domain you want to add to your account'
                        }
                    </DialogDescription>
                </DialogHeader>

                {!createdDomain ? (
                    <>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="domain">Domain Name</Label>
                                <Input
                                    id="domain"
                                    value={domain}
                                    onChange={(e) => setDomain(e.target.value)}
                                    placeholder="example.com"
                                    disabled={isLoading}
                                />
                                <p className="text-xs text-muted-foreground">
                                    Enter your domain without http:// or www.
                                </p>
                            </div>
                        </div>

                        <DialogFooter>
                            <Button
                                variant="outline"
                                onClick={handleClose}
                                disabled={isLoading}
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleCreate}
                                disabled={isLoading || !domain}
                            >
                                {isLoading && <Loader2Icon className="w-4 h-4 mr-2 animate-spin" />}
                                {isLoading ? "Adding..." : "Add Domain"}
                            </Button>
                        </DialogFooter>
                    </>
                ) : (
                    <>
                        <div className="max-h-[60vh] overflow-y-auto pr-2">
                            <Alert className="mb-4">
                                <Info className="h-4 w-4" />
                                <AlertDescription>
                                    Add these DNS records to your domain&apos;s DNS settings. Verification can take up to 48 hours, but is usually much faster.
                                </AlertDescription>
                            </Alert>

                            <div className="space-y-4">
                                {createdDomain.dnsRecords.map((record, index) => (
                                    <Card key={index}>
                                        <CardHeader className="pb-3">
                                            <div className="flex items-center justify-between">
                                                <CardTitle className="text-sm font-medium flex items-center gap-2">
                                                    <Badge className={getRecordTypeColor(record.purpose)}>
                                                        {record.type}
                                                    </Badge>
                                                    <span className="text-xs uppercase text-muted-foreground">
                                                        {record.purpose}
                                                    </span>
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

                            <Separator className="my-4" />

                            <div className="bg-muted p-4 rounded-lg space-y-2">
                                <h4 className="text-sm font-medium">Next Steps:</h4>
                                <ol className="text-sm space-y-1 list-decimal list-inside text-muted-foreground">
                                    <li>Add these DNS records to your domain provider</li>
                                    <li>Wait for DNS propagation (usually 5-30 minutes)</li>
                                    <li>Click the verify button in the domains table</li>
                                    <li>Once verified, you can send emails from this domain</li>
                                </ol>
                            </div>
                        </div>

                        <DialogFooter>
                            <Button onClick={handleClose}>
                                Done
                            </Button>
                        </DialogFooter>
                    </>
                )}
            </DialogContent>
        </Dialog>
    )
}

export default AddDomainDialog
