'use client'

import React, { useState } from 'react'
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Copy, Check, Trash2, TicketIcon } from 'lucide-react'
import { toast } from "sonner"
import { useOrganisationInvites } from '@/hooks/useOrganisationInvites'
import { deleteInviteCodeAdmin } from '@/services/firebase/admin-delete'
import { withTokenRefresh } from '@/utils/token-refresh'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { Loader2Icon } from 'lucide-react'
import { extractRoleBadgeVariant } from '@/utils/extract'
import { formatDateByTimeAgo } from '@/utils/formatters'

interface Props {
    orgId: string | null;
}

const ActiveInviteCodesDialog: React.FC<Props> = ({ orgId }) => {
    const { invites, loading, error, refetch } = useOrganisationInvites(orgId);
    const [copiedCode, setCopiedCode] = useState<string | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    function handleCopy(code: string) {
        navigator.clipboard.writeText(code)
        setCopiedCode(code)
        toast.success("Code copied to clipboard")
        setTimeout(() => setCopiedCode(null), 2000)
    }

    async function handleDelete(inviteId: string) {
        if (!orgId) return;

        try {
            setDeletingId(inviteId);

            const { error } = await withTokenRefresh((idToken) =>
                deleteInviteCodeAdmin({
                    idToken,
                    inviteId,
                    orgId
                })
            );

            if (error) throw new Error(error);

            toast.success("Invite code deleted");
            await refetch();
        } catch (err) {
            console.error("Failed to delete invite code:", err);
            toast.error(err instanceof Error ? err.message : "Failed to delete invite code");
        } finally {
            setDeletingId(null);
        }
    }

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                    <TicketIcon className="w-4 h-4 mr-2" />
                    Active Invite Codes
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className='mb-2'>Active Invite Codes</DialogTitle>
                    <Separator />
                    <DialogDescription>
                        View and manage all active invitation codes for your organisation.
                    </DialogDescription>
                </DialogHeader>

                <div className='pt-4'>
                    {loading && (
                        <div className="space-y-2">
                            <Skeleton className="h-10 w-full rounded-lg" />
                            <Skeleton className="h-16 w-full rounded-lg" />
                            <Skeleton className="h-16 w-full rounded-lg" />
                            <Skeleton className="h-16 w-full rounded-lg" />
                        </div>
                    )}

                    {error && (
                        <div className="text-sm text-destructive py-4">
                            Error: {error}
                        </div>
                    )}

                    {!loading && !error && invites && invites.length === 0 && (
                        <div className="text-sm text-muted-foreground text-center py-8">
                            No active invite codes found. Create one using the &quot;Add Member&quot; button.
                        </div>
                    )}

                    {!loading && !error && invites && invites.length > 0 && (
                        <div className="border rounded-lg">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Invite Code</TableHead>
                                        <TableHead>Role</TableHead>
                                        <TableHead>Uses Left</TableHead>
                                        <TableHead>Created</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {invites.map((invite) => (
                                        <TableRow key={invite.id}>
                                            <TableCell className="font-mono text-sm">
                                                {invite.id}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={extractRoleBadgeVariant(invite.role)}>
                                                    {invite.role?.charAt(0).toUpperCase()}{invite.role?.slice(1)}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                {invite.usesLeft ?? 0}
                                            </TableCell>
                                            <TableCell>
                                                {formatDateByTimeAgo(invite.createdAt)}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleCopy(invite.id as string)}
                                                        disabled={!invite.id}
                                                    >
                                                        {copiedCode === invite.id ? (
                                                            <Check className="w-4 h-4" />
                                                        ) : (
                                                            <Copy className="w-4 h-4" />
                                                        )}
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleDelete(invite.id as string)}
                                                        disabled={deletingId === invite.id || !invite.id}
                                                    >
                                                        {deletingId === invite.id ? (
                                                            <Loader2Icon className="w-4 h-4 animate-spin" />
                                                        ) : (
                                                            <Trash2 className="w-4 h-4 text-destructive" />
                                                        )}
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}

export default ActiveInviteCodesDialog
