"use client"

// Local Imports
import { IUser } from '@/models/user';
import { Badge } from '../../ui/badge';
import { Input } from '../../ui/input';
import NoContent from '../../ui/no-content';
import { Button } from '../../ui/button';
import { hexToRgba } from '@/utils/color-conversion';
import { IOrganisation } from '@/models/organisation';
import UpdateMemberDialog from './UpdateMemberDialog';
import { IconDotsVertical } from '@tabler/icons-react';
import { useOrganisationMembers } from '@/hooks/useOrganisationMembers';
import { updateOrganisationMember } from '@/services/firebase/update';
import { Card, CardContent } from '../../ui/card';
import { levelFourAccess, levelsToColors, OrgRoleColorType } from '@/constants/access';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../../ui/dropdown-menu';
import { Skeleton } from '../../ui/skeleton';

// External Imports
import { ChevronLeft, ChevronRight, Users } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import React, { useState } from 'react'
import { toast } from 'sonner';
import { useSession } from 'next-auth/react';
import { memberLimits, TABLE_SIZE_LIMIT } from '@/constants/limits';
import { membersSearchFilter } from '@/utils/filters';
import { ProfileImage } from '@/components/icons/icons';


interface Props {
    organisation: IOrganisation;
}
const MembersTable: React.FC<Props> = ({ organisation }) => {
    const { data: session } = useSession();
    const { members, loading: loadingMembers, error: membersError, refetch: refetchMembers } = useOrganisationMembers(organisation?.id as string);

    // Limits
    const subscriptionType = organisation?.subscription || 'free';
    const memberLimit = memberLimits[subscriptionType];
    const membersCount = organisation?.members || 0;

    // Search
    const [searchQuery, setSearchQuery] = useState('')

    // Filter members based on search query
    const filteredMembers = membersSearchFilter(members ?? [], searchQuery)

    // Pagination
    const [page, setPage] = useState(1)

    // Reset to page 1 when search query changes
    const handleSearchChange = (value: string) => {
        setSearchQuery(value)
        setPage(1)
    }
    const pageCount = Math.ceil((filteredMembers?.length ?? 0) / TABLE_SIZE_LIMIT)
    const pagedMembers = filteredMembers?.slice((page - 1) * TABLE_SIZE_LIMIT, page * TABLE_SIZE_LIMIT) ?? [];


    async function handleRemove(member: IUser) {
        try {
            const { error } = await updateOrganisationMember({ member, organisation, remove: true });
            if (error) throw error;

            toast("Member removed", {
                description: "This member has been successfully removed",
            });

        } catch {
            toast("Failed to remove member", {
                description: "Something went wrong while removing this member. Please try again.",
            });
        }
    }
    return (
        <div>
            <div className="overflow-x-auto">
                {loadingMembers ? (
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
                ) : membersError ? (
                    <NoContent text={membersError} />
                ) : (
                    <>
                        <div className="pb-4 pr-2 flex items-center justify-between">
                            <Input
                                placeholder="Search by name, email, or role..."
                                value={searchQuery}
                                onChange={(e) => handleSearchChange(e.target.value)}
                                className="max-w-sm ml-1"
                            />
                            <div className="flex items-center gap-3 p-2 border rounded-lg">
                                <div className="p-2 rounded-md bg-blue-500/10">
                                    <Users className="w-5 h-5 text-blue-500" />
                                </div>
                                <p className="text-xl font-semibold">
                                    {membersCount} / {memberLimit === -1 ? 'Unlimited' : memberLimit}
                                </p>
                            </div>
                        </div>
                        <Table>
                            <TableHeader>
                                <TableRow className='border-0!'>
                                    <TableHead className='rounded-l-xl'>Name</TableHead>
                                    <TableHead separator={true}>Email</TableHead>
                                    <TableHead separator={true}>Role</TableHead>
                                    <TableHead separator={true} className='flex justify-end'>Joined</TableHead>
                                    <TableHead className='rounded-r-xl'></TableHead>
                                </TableRow>
                            </TableHeader>
                            <thead className="h-1"></thead>
                            <TableBody>
                                {pagedMembers.map((m) => (
                                    <TableRow key={m.id}>
                                        <TableCell className="rounded-l-lg">
                                            <div className='flex items-center gap-3'>
                                                <ProfileImage image={m.brand?.imageUrl as string} name={`${m.firstname?.slice(0, 1)}${m.lastname?.slice(0, 1)}`} />
                                                <span className='font-medium'>{m.firstname} {m.lastname}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>{m.email}</TableCell>
                                        <TableCell className="capitalize">
                                            <Badge
                                                variant="custom"
                                                className={`font-bold! rounded-sm! bg-[${levelsToColors[m.organisation?.role as OrgRoleColorType]}]`}
                                                style={{
                                                    color: levelsToColors[m.organisation?.role as OrgRoleColorType],
                                                    backgroundColor: hexToRgba(levelsToColors[m.organisation?.role as OrgRoleColorType], 0.15),
                                                }}
                                            >
                                                {m.organisation?.role}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-end">
                                            {m.organisation?.joinedAt
                                                ? formatDistanceToNow(m.organisation?.joinedAt, { addSuffix: true })
                                                : "—"}
                                        </TableCell>
                                        {(levelFourAccess.includes(session?.user.organisation?.role as string) &&
                                            m.id !== session?.user.id &&
                                            m.organisation?.role !== "owner") ? (
                                            <TableCell className='flex justify-end rounded-r-lg'>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button
                                                            variant="ghost"
                                                            className="data-[state=open]:bg-muted text-muted-foreground flex size-8"
                                                            size="icon"
                                                        >
                                                            <IconDotsVertical />
                                                            <span className="sr-only">Open menu</span>
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="w-32">
                                                        <UpdateMemberDialog member={m} organisation={m.organisation as IOrganisation} refetch={refetchMembers} />
                                                        <DropdownMenuItem variant="destructive" onClick={() => handleRemove(m)}>Remove</DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        ) : (
                                            <TableCell className='rounded-r-lg'></TableCell>
                                        )}
                                    </TableRow>
                                ))}
                                {pagedMembers.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={4} className="text-center text-muted-foreground">
                                            No members found
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
                    {pagedMembers.length} of {membersCount}
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

export default MembersTable
