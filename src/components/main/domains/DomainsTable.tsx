"use client"

import React, { useState } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { ChevronLeft, ChevronRight, GlobeLock, Shield, ShieldCheck, ShieldAlert, Trash2, RefreshCw } from 'lucide-react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../ui/table'
import { Card, CardContent } from '../../ui/card'
import { TABLE_SIZE_LIMIT } from '@/constants/limits'
import { useDomains } from '@/hooks/useDomains'
import { Button } from '../../ui/button'
import NoContent from '../../ui/no-content'
import { Input } from '../../ui/input'
import { Badge } from '../../ui/badge'
import { Skeleton } from "@/components/ui/skeleton"
import { IDomain } from '@/models/domain'
import { deleteDomain } from '@/services/firebase/domains/delete'
import { verifyDomain } from '@/services/firebase/domains/verify'
import { toast } from 'sonner'
import { removeSessionStorage } from '@/utils/storage-handlers'
import { domainsCookieKey } from '@/constants/cookies'

interface Props {
    organisationId: string
    onViewDomain?: (domain: IDomain) => void
    canEdit?: boolean;
}

const DomainsTable: React.FC<Props> = ({ organisationId, onViewDomain, canEdit }) => {
    const { domains, loading, error, refetch } = useDomains(organisationId)
    const [searchQuery, setSearchQuery] = useState('')
    const [page, setPage] = useState(1)
    const [verifyingId, setVerifyingId] = useState<string | null>(null)
    const [deletingId, setDeletingId] = useState<string | null>(null)

    // Filter domains based on search query
    const filteredDomains = domains?.filter(domain =>
        domain.domain.toLowerCase().includes(searchQuery.toLowerCase())
    ) ?? []

    const handleSearchChange = (value: string) => {
        setSearchQuery(value)
        setPage(1)
    }

    const pageCount = Math.ceil(filteredDomains.length / TABLE_SIZE_LIMIT)
    const pagedDomains = filteredDomains.slice((page - 1) * TABLE_SIZE_LIMIT, page * TABLE_SIZE_LIMIT)

    const handleVerifyDomain = async (domainId: string) => {
        setVerifyingId(domainId)
        try {
            const result = await verifyDomain(organisationId, domainId)
            if (result.error) {
                toast.error(result.error)
            } else {
                toast.success('Domain verification check completed')
                removeSessionStorage(domainsCookieKey)
                await refetch()
            }
        } catch (error) {
            console.log(error)
            toast.error('Failed to verify domain')
        } finally {
            setVerifyingId(null)
        }
    }

    const handleDeleteDomain = async (domainId: string) => {
        if (!confirm('Are you sure you want to delete this domain?')) {
            return
        }

        setDeletingId(domainId)
        try {
            const result = await deleteDomain(organisationId, domainId)
            if (result.error) {
                toast.error(result.error)
            } else {
                toast.success('Domain deleted successfully')
                removeSessionStorage(domainsCookieKey)
                await refetch()
            }
        } catch (error) {
            console.log(error)
            toast.error('Failed to delete domain')
        } finally {
            setDeletingId(null)
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
                    Pending
                </Badge>
            case 'failed':
                return <Badge variant="destructive" className="gap-1">
                    <ShieldAlert className="w-3 h-3" />
                    Failed
                </Badge>
        }
    }

    const getEmailStatusBadge = (emailEnabled: boolean) => {
        return emailEnabled ? (
            <Badge variant="default" className="bg-blue-500/10 text-blue-600 hover:bg-blue-500/20">
                Enabled
            </Badge>
        ) : (
            <Badge variant="secondary">
                Disabled
            </Badge>
        )
    }

    return (
        <div>
            <div className="overflow-x-auto">
                {loading ? (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <Skeleton className="h-10 w-80" />
                            <Skeleton className="h-16 w-32" />
                        </div>
                        <Card>
                            <CardContent className="p-0">
                                <div className="space-y-3 p-4">
                                    {Array.from({ length: 5 }).map((_, i) => (
                                        <div key={i} className="flex items-center gap-4">
                                            <div className="flex-1 space-y-2">
                                                <Skeleton className="h-4 w-48" />
                                                <Skeleton className="h-3 w-32" />
                                            </div>
                                            <Skeleton className="h-6 w-20" />
                                            <Skeleton className="h-4 w-24" />
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                ) : error ? (
                    <NoContent text={error} />
                ) : (
                    <>
                        <div className="pb-4 pr-2 flex items-center justify-between">
                            <Input
                                placeholder="Search domains..."
                                value={searchQuery}
                                onChange={(e) => handleSearchChange(e.target.value)}
                                className="max-w-sm ml-1"
                                disabled={!canEdit}
                            />
                            <div className="flex items-center gap-3 p-2 border rounded-lg">
                                <div className="p-2 rounded-md bg-purple-500/10">
                                    <GlobeLock className="w-5 h-5 text-purple-500" />
                                </div>
                                <p className="text-xl font-semibold">
                                    {domains?.length ?? 0}
                                </p>
                            </div>
                        </div>
                        <Table>
                            <TableHeader>
                                <TableRow className='border-0!'>
                                    <TableHead className='rounded-l-xl'>Domain</TableHead>
                                    <TableHead separator={true}>Verification</TableHead>
                                    <TableHead separator={true}>Email Status</TableHead>
                                    <TableHead separator={true}>Created</TableHead>
                                    <TableHead separator={true} className='rounded-r-xl'>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {pagedDomains.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center h-32">
                                            <NoContent text="No domains found" />
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    pagedDomains.map((domain, index) => (
                                        <TableRow
                                            key={domain.id}
                                            className={`cursor-pointer hover:bg-muted/50 ${index === pagedDomains.length - 1 ? 'border-0!' : ''}`}
                                            onClick={() => onViewDomain?.(domain)}
                                        >
                                            <TableCell className='font-medium'>
                                                <div className="flex items-center gap-2">
                                                    <GlobeLock className="w-4 h-4 text-muted-foreground" />
                                                    {domain.domain}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {getVerificationBadge(domain.verificationStatus)}
                                            </TableCell>
                                            <TableCell>
                                                {getEmailStatusBadge(domain.emailEnabled)}
                                            </TableCell>
                                            <TableCell className="text-muted-foreground">
                                                {formatDistanceToNow(new Date(domain.createdAt), { addSuffix: true })}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleVerifyDomain(domain.id)}
                                                        disabled={verifyingId === domain.id}
                                                    >
                                                        <RefreshCw className={`w-4 h-4 ${verifyingId === domain.id ? 'animate-spin' : ''}`} />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleDeleteDomain(domain.id)}
                                                        disabled={deletingId === domain.id}
                                                    >
                                                        <Trash2 className="w-4 h-4 text-destructive" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>

                        {pageCount > 1 && (
                            <div className="flex items-center justify-between p-4">
                                <p className="text-sm text-muted-foreground">
                                    Page {page} of {pageCount}
                                </p>
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setPage(p => Math.max(1, p - 1))}
                                        disabled={page === 1}
                                    >
                                        <ChevronLeft className="w-4 h-4" />
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setPage(p => Math.min(pageCount, p + 1))}
                                        disabled={page === pageCount}
                                    >
                                        <ChevronRight className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    )
}

export default DomainsTable
