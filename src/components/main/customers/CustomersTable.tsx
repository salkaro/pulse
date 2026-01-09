"use client"

// External Imports
import React, { useState } from 'react'
import { formatDistanceToNow } from 'date-fns';
import { ChevronLeft, ChevronRight, Users } from 'lucide-react';

// Local Imports
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../ui/table';
import { Card, CardContent } from '../../ui/card';
import { TABLE_SIZE_LIMIT } from '@/constants/limits';
import { useCustomers } from '@/hooks/useCustomers';
import { Button } from '../../ui/button';
import NoContent from '../../ui/no-content';
import { Input } from '../../ui/input';
import { Badge } from '../../ui/badge';
import { Skeleton } from "@/components/ui/skeleton";
import { extractCustomerStatus } from "@/utils/extract";
import { customersSearchFilter } from '@/utils/filters';
import { ProfileImage } from '@/components/icons/icons';
import { useConnections } from '@/hooks/useConnections';
import NoConnectionAttached from '@/components/ui/no-connection-attached';

interface Props {
    organisationId: string;
}

const CustomersTable: React.FC<Props> = ({ organisationId }) => {
    const { connections } = useConnections(organisationId)
    const { customers, loading: loadingCustomers, error: customersError } = useCustomers(organisationId);

    // Search
    const [searchQuery, setSearchQuery] = useState('')

    // Filter customers based on search query
    const filteredCustomers = customersSearchFilter(customers, searchQuery)

    // Pagination
    const [page, setPage] = useState(1)

    // Reset to page 1 when search query changes
    const handleSearchChange = (value: string) => {
        setSearchQuery(value)
        setPage(1)
    }

    const pageCount = Math.ceil((filteredCustomers?.length ?? 0) / TABLE_SIZE_LIMIT)
    const pagedCustomers = filteredCustomers?.slice((page - 1) * TABLE_SIZE_LIMIT, page * TABLE_SIZE_LIMIT) ?? [];

    if (!connections || connections.length === 0) {
        return <NoConnectionAttached />
    }

    return (
        <div>
            <div className="overflow-x-auto">
                {loadingCustomers ? (
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
                                            <Skeleton className="h-10 w-10 rounded-full" />
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
                ) : customersError ? (
                    <NoContent text={customersError} />
                ) : (
                    <>
                        <div className="pb-4 pr-2 flex items-center justify-between">
                            <Input
                                placeholder="Search by name, email, or description..."
                                value={searchQuery}
                                onChange={(e) => handleSearchChange(e.target.value)}
                                className="max-w-sm ml-1"
                            />
                            <div className="flex items-center gap-3 p-2 border rounded-lg">
                                <div className="p-2 rounded-md bg-blue-500/10">
                                    <Users className="w-5 h-5 text-blue-500" />
                                </div>
                                <p className="text-xl font-semibold">
                                    {customers?.length ?? 0}
                                </p>
                            </div>
                        </div>
                        <Table>
                            <TableHeader>
                                <TableRow className='border-0!'>
                                    <TableHead className='rounded-l-xl'>Customer</TableHead>
                                    <TableHead separator={true}>Email</TableHead>
                                    <TableHead separator={true}>Status</TableHead>
                                    <TableHead separator={true} className='flex justify-end'>Created</TableHead>
                                    <TableHead className="rounded-r-xl"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <thead className="h-1"></thead>
                            <TableBody>
                                {pagedCustomers.map((customer) => {
                                    const status = extractCustomerStatus(customer);
                                    const name = customer.name;
                                    const email = customer.email;

                                    return (
                                        <TableRow key={customer.id}>
                                            <TableCell className="rounded-l-lg">
                                                <div className='flex items-center gap-3'>
                                                    <ProfileImage image={customer.imageUrl} name={name} email={email} />
                                                    <div className='flex flex-col'>
                                                        <span className='font-medium'>{name || 'No name'}</span>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>{email || '—'}</TableCell>
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
                                            <TableCell className="text-end">
                                                {customer.createdAt
                                                    ? formatDistanceToNow(customer.createdAt * 1000, { addSuffix: true })
                                                    : "—"}
                                            </TableCell>
                                            <TableCell className="rounded-r-lg"></TableCell>
                                        </TableRow>
                                    );
                                })}
                                {pagedCustomers.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={4} className="text-center text-muted-foreground">
                                            No customers found
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </>
                )}
            </div>
            <div className="mt-4 w-full flex justify-between">
                <div className='text-sm text-muted-foreground pl-2'>
                    {pagedCustomers.length} of {customers?.length ?? 0}
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

export default CustomersTable
