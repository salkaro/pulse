"use client"

// External Imports
import { format } from 'date-fns';
import React, { useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight, TrendingUp, RefreshCw, ReceiptText, MoreVertical, ExternalLink, Eye } from 'lucide-react';

// Local Imports
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../ui/table';
import { TABLE_SIZE_LIMIT } from '@/constants/limits';
import { useCharges } from '@/hooks/useCharges';
import { Button } from '../../ui/button';
import NoContent from '../../ui/no-content';
import { Input } from '../../ui/input';
import { Badge } from '../../ui/badge';
import { Spinner } from "@/components/ui/spinner";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '../../ui/dropdown-menu';
import { useEntities } from '@/hooks/useEntities';
import { extractChargeStatus, extractEntityById } from '@/utils/extract';
import { formatCurrency } from '@/utils/formatters';
import { chargeSearchFilter } from '@/utils/filters';
import { ProfileImage } from '@/components/icons/icons';

interface Props {
    organisationId: string;
}

const PaymentsTable: React.FC<Props> = ({ organisationId }) => {
    const { chargesByConnection, loading, error, refetch } = useCharges(organisationId);
    const { entities } = useEntities(organisationId)

    // Search
    const [refreshing, setRefreshing] = useState(loading)
    const [searchQuery, setSearchQuery] = useState("")
    const [page, setPage] = useState(1)

    // Flatten all charges across connections and deduplicate by ID
    const charges = Object.values(chargesByConnection ?? {}).flat();

    // Search Filtering
    const filteredCharges = useMemo(() => {
        return chargeSearchFilter(charges, searchQuery)
    }, [charges, searchQuery])

    // Sort by createdAt (newest first)
    const sortedCharges = useMemo(() => {
        return [...filteredCharges].sort((a, b) => {
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        })
    }, [filteredCharges])

    // Pagination
    const pageCount = Math.ceil(sortedCharges.length / TABLE_SIZE_LIMIT)
    const pagedCharges = sortedCharges.slice(
        (page - 1) * TABLE_SIZE_LIMIT,
        page * TABLE_SIZE_LIMIT
    )

    // Helpers
    const handleSearchChange = (value: string) => {
        setSearchQuery(value)
        setPage(1)
    }


    async function handleRefresh() {
        setRefreshing(false);
        await refetch();
    }

    // Totals
    const totalRevenue = sortedCharges.reduce((sum, charge) => {
        if (charge.status === "successful") {
            return sum + charge.amount
        }
        return sum
    }, 0)

    return (
        <div>
            <div className="overflow-x-auto">
                {(loading && refreshing) ? (
                    <div className="flex justify-center p-4">
                        <Spinner />
                    </div>
                ) : error ? (
                    <NoContent text={error} />
                ) : (
                    <>
                        <div className="pb-4 pr-2 flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
                            <div className="flex items-center gap-2 w-full">
                                <Input
                                    placeholder="Search by customer, amount, or description..."
                                    value={searchQuery}
                                    onChange={(e) => handleSearchChange(e.target.value)}
                                    className="flex-1 w-full md:max-w-sm ml-1"
                                />
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className='shadow-none'
                                    onClick={() => handleRefresh()}
                                    disabled={loading}
                                >
                                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                                </Button>
                            </div>
                            <div className="flex items-center justify-end gap-2 md:gap-3 w-full">
                                <div className="flex items-center gap-2 md:gap-3 p-2 border rounded-lg flex-1 md:flex-initial">
                                    <div className="p-2 rounded-md bg-green-500/10">
                                        <TrendingUp className="w-4 h-4 md:w-5 md:h-5 text-green-500" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground">Revenue</p>
                                        <p className="text-base md:text-lg font-semibold">
                                            {formatCurrency(totalRevenue, charges?.[0]?.currency)}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 md:gap-3 p-2 border rounded-lg flex-1 md:flex-initial">
                                    <div className="p-2 rounded-md bg-blue-500/10">
                                        <ReceiptText className="w-4 h-4 md:w-5 md:h-5 text-blue-500" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground">Transactions</p>
                                        <p className="text-base md:text-lg text-end font-semibold">
                                            {charges?.length ?? 0}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <Table>
                            <TableHeader>
                                <TableRow className='border-0!'>
                                    <TableHead className='rounded-l-xl'>Entity</TableHead>
                                    <TableHead separator={true}>Tag</TableHead>
                                    <TableHead separator={true}>Date</TableHead>
                                    <TableHead separator={true}>Status</TableHead>
                                    <TableHead separator={true}>
                                        Amount
                                    </TableHead>
                                    <TableHead className='rounded-r-xl w-12.5'></TableHead>
                                </TableRow>
                            </TableHeader>
                            <thead className="h-1"></thead>
                            <TableBody>
                                {pagedCharges.map((charge) => {
                                    const status = extractChargeStatus(charge);
                                    const entity = extractEntityById(entities, charge?.entityId);
                                    const image = entity?.images?.logo.primary as string;
                                    return (
                                        <TableRow key={charge.id}>
                                            <TableCell className="rounded-l-lg">
                                                <div className='flex items-center gap-4'>
                                                    <ProfileImage image={image} name={entity?.name} email={charge.email}/>
                                                    <div className='flex flex-col'>
                                                        <span className='font-medium'>{entity?.name}</span>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant="custom"
                                                    className="rounded-sm! bg-accent"
                                                >
                                                    {charge.type === 'one-time' ? 'One-time' : 'Recurring'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className='font-semibold'>
                                                {format(new Date(charge.createdAt), 'dd MMM, yyyy')}
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant="custom"
                                                    className="rounded-sm!"
                                                    style={{
                                                        color: status.color,
                                                        backgroundColor: `${status.color}26`,
                                                    }}
                                                >
                                                    {status.label}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="font-semibold">
                                                {formatCurrency(charge.amount, charge.currency)}
                                            </TableCell>
                                            <TableCell className="rounded-r-lg">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8">
                                                            <MoreVertical className="h-4 w-4 text-muted-foreground" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        {charge.receipt_url && (
                                                            <DropdownMenuItem
                                                                onClick={() => window.open(charge.receipt_url, '_blank')}
                                                            >
                                                                <Eye className="mr-2 h-4 w-4" />
                                                                View Receipt
                                                            </DropdownMenuItem>
                                                        )}
                                                        <DropdownMenuItem
                                                            onClick={() => window.open(`https://dashboard.stripe.com/payments/${charge.id}`, '_blank')}
                                                        >
                                                            <ExternalLink className="mr-2 h-4 w-4" />
                                                            Inspect in Stripe
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                                {pagedCharges.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center text-muted-foreground">
                                            No charges found
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </>
                )}
            </div>
            <div className="w-full flex justify-between mt-4">
                <div className='text-sm text-muted-foreground pl-2'>
                    {pagedCharges.length} of {charges?.length ?? 0}
                </div>
                <div className='flex'>
                    <Button
                        size="sm"
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className='rounded-r-none'
                    >
                        <ChevronLeft />
                    </Button>
                    <Button
                        size="sm"
                        className='flex justify-center rounded-none'
                        disabled={page === pageCount || page === 1}
                    >
                        {page} of {pageCount || 1}
                    </Button>
                    <Button
                        size="sm"
                        onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
                        disabled={page === pageCount}
                        className='rounded-l-none'
                    >
                        <ChevronRight />
                    </Button>
                </div>
            </div>
        </div>
    )
}

export default PaymentsTable
