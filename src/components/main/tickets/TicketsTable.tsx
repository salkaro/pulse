"use client"

// External Imports
import { formatDistanceToNow } from 'date-fns';
import React, { useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight, TicketIcon, RefreshCw } from 'lucide-react';

// Local Imports
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../ui/table';
import { TABLE_SIZE_LIMIT } from '@/constants/limits';
import { useTickets } from '@/hooks/useTickets';
import { Button } from '../../ui/button';
import NoContent from '../../ui/no-content';
import { Input } from '../../ui/input';
import { Badge } from '../../ui/badge';
import { Spinner } from "@/components/ui/spinner";
import { useEntities } from '@/hooks/useEntities';
import { extractEntityById } from '@/utils/extract';
import { ProfileImage } from '@/components/icons/icons';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { TicketStatus, TicketTag } from '@/models/ticket';

interface Props {
    organisationId: string;
}

const TicketsTable: React.FC<Props> = ({ organisationId }) => {
    const { ticketsByEntity, loading, error, refetch } = useTickets(organisationId);
    const { entities } = useEntities(organisationId)

    // Search and filters
    const [refreshing, setRefreshing] = useState(loading)
    const [searchQuery, setSearchQuery] = useState("")
    const [statusFilter, setStatusFilter] = useState<TicketStatus | "all">("all")
    const [tagFilter, setTagFilter] = useState<TicketTag | "all">("all")
    const [page, setPage] = useState(1)

    // Flatten all tickets across entities
    const tickets = Object.entries(ticketsByEntity ?? {}).flatMap(([entityId, entityTickets]) =>
        entityTickets.map(ticket => ({ ...ticket, entityId }))
    );

    // Search and filter
    const filteredTickets = useMemo(() => {
        let result = tickets;

        // Search filter
        if (searchQuery) {
            const queryLower = searchQuery.toLowerCase()
            result = result.filter((ticket) => {
                const title = ticket.title?.toLowerCase() ?? ""
                const description = ticket.description?.toLowerCase() ?? ""
                const customerName = ticket.customer.name?.toLowerCase() ?? ""
                const customerEmail = ticket.customer.email?.toLowerCase() ?? ""
                const issueLocation = ticket.issueLocation?.toLowerCase() ?? ""

                return (
                    title.includes(queryLower) ||
                    description.includes(queryLower) ||
                    customerName.includes(queryLower) ||
                    customerEmail.includes(queryLower) ||
                    issueLocation.includes(queryLower)
                )
            })
        }

        // Status filter
        if (statusFilter !== "all") {
            result = result.filter(ticket => ticket.status === statusFilter)
        }

        // Tag filter
        if (tagFilter !== "all") {
            result = result.filter(ticket => ticket.tag === tagFilter)
        }

        return result
    }, [tickets, searchQuery, statusFilter, tagFilter])

    // Sort by createdAt (newest first)
    const sortedTickets = useMemo(() => {
        return [...filteredTickets].sort((a, b) => b.createdAt - a.createdAt)
    }, [filteredTickets])

    // Pagination
    const pageCount = Math.ceil(sortedTickets.length / TABLE_SIZE_LIMIT)
    const pagedTickets = sortedTickets.slice(
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

    const getTagColor = (tag?: TicketTag) => {
        switch (tag) {
            case "critical":
                return { color: '#ef4444', label: 'Critical' };
            case "important":
                return { color: '#f97316', label: 'Important' };
            case "normal":
            default:
                return { color: '#3b82f6', label: 'Normal' };
        }
    }

    const getStatusColor = (status: TicketStatus) => {
        switch (status) {
            case "resolved":
                return { color: '#10b981', label: 'Resolved' };
            case "active":
                return { color: '#f59e0b', label: 'Active' };
            default:
                return { color: '#6b7280', label: status };
        }
    }

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
                                    placeholder="Search by title, customer, or location..."
                                    value={searchQuery}
                                    onChange={(e) => handleSearchChange(e.target.value)}
                                    className="flex-1 max-w-md ml-1"
                                />
                                <Button
                                    size="icon"
                                    variant="outline"
                                    className='shadow-none'
                                    onClick={handleRefresh}
                                >
                                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                                </Button>
                                <Select value={statusFilter} onValueChange={(value) => { setStatusFilter(value as TicketStatus | "all"); setPage(1); }}>
                                    <SelectTrigger className="w-[140px shadow-none">
                                        <SelectValue placeholder="Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Status</SelectItem>
                                        <SelectItem value="active">Active</SelectItem>
                                        <SelectItem value="resolved">Resolved</SelectItem>
                                    </SelectContent>
                                </Select>
                                <Select value={tagFilter} onValueChange={(value) => { setTagFilter(value as TicketTag | "all"); setPage(1); }}>
                                    <SelectTrigger className="w-35 shadow-none">
                                        <SelectValue placeholder="Tag" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Tags</SelectItem>
                                        <SelectItem value="normal">Normal</SelectItem>
                                        <SelectItem value="important">Important</SelectItem>
                                        <SelectItem value="critical">Critical</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="flex items-center gap-3 p-2 border rounded-lg">
                                    <div className="p-2 rounded-md bg-purple-500/10">
                                        <TicketIcon className="w-5 h-5 text-purple-500" />
                                    </div>
                                    <p className="text-xl font-semibold">
                                        {sortedTickets.length}
                                    </p>
                                </div>
                            </div>
                        </div>
                        <Table>
                            <TableHeader>
                                <TableRow className='border-0!'>
                                    <TableHead className='rounded-l-xl'>Customer</TableHead>
                                    <TableHead separator={true}>Title</TableHead>
                                    <TableHead separator={true}>Entity</TableHead>
                                    <TableHead separator={true}>Tag</TableHead>
                                    <TableHead separator={true}>Status</TableHead>
                                    <TableHead separator={true} className="rounded-r-xl">Created</TableHead>
                                </TableRow>
                            </TableHeader>
                            <thead className="h-1"></thead>
                            <TableBody>
                                {pagedTickets.map((ticket) => {
                                    const entity = extractEntityById(entities, ticket.entityId);
                                    const tagInfo = getTagColor(ticket.tag);
                                    const statusInfo = getStatusColor(ticket.status);

                                    return (
                                        <TableRow key={ticket.id}>
                                            <TableCell className="rounded-l-lg">
                                                <div className='flex items-center gap-3'>
                                                    <ProfileImage
                                                        image={ticket.customer.imageUrl}
                                                        name={ticket.customer.name}
                                                        email={ticket.customer.email}
                                                    />
                                                    <div className='flex flex-col'>
                                                        <span className='font-medium'>{ticket.customer.name || 'No name'}</span>
                                                        <span className='text-xs text-muted-foreground'>{ticket.customer.email || '—'}</span>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className='flex flex-col'>
                                                    <span className='font-medium'>{ticket.title}</span>
                                                    {ticket.description && (
                                                        <span className='text-xs text-muted-foreground line-clamp-1'>{ticket.description}</span>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <span className='text-sm'>{entity?.name || '—'}</span>
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant="custom"
                                                    className="rounded-sm!"
                                                    style={{
                                                        color: tagInfo.color,
                                                        backgroundColor: `${tagInfo.color}26`,
                                                    }}
                                                >
                                                    {tagInfo.label}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant="custom"
                                                    className="rounded-sm!"
                                                    style={{
                                                        color: statusInfo.color,
                                                        backgroundColor: `${statusInfo.color}26`,
                                                    }}
                                                >
                                                    {statusInfo.label}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                {ticket.createdAt
                                                    ? formatDistanceToNow(ticket.createdAt * 1000, { addSuffix: true })
                                                    : "—"}
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                                {pagedTickets.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center text-muted-foreground">
                                            No tickets found
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
                    {pagedTickets.length} of {sortedTickets.length}
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

export default TicketsTable
