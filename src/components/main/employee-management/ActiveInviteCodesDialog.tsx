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
import { Copy, Check, Trash2, TicketIcon, Mail } from 'lucide-react'
import { toast } from "sonner"
import { useOrganisationInvites } from '@/hooks/useOrganisationInvites'
import { deleteInviteCodeAdmin } from '@/services/firebase/admin-delete'
import { withTokenRefresh } from '@/utils/token-refresh'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { Loader2Icon } from 'lucide-react'
import { extractRoleBadgeVariant } from '@/utils/extract'
import { formatDateByTimeAgo } from '@/utils/formatters'
import { IOrganisation } from '@/models/organisation'
import { sendInviteEmail } from '@/services/pulse/send-invite-email'
import { useSession } from 'next-auth/react'
import { useTokens } from '@/hooks/useTokens'
import { root } from '@/constants/site'

interface Props {
    orgId: string | null;
    organisation: IOrganisation | null;
}

const ActiveInviteCodesDialog: React.FC<Props> = ({ orgId, organisation }) => {
    const { invites, loading, error, refetch } = useOrganisationInvites(orgId);
    const { tokens } = useTokens(orgId);
    const { data: session } = useSession();
    const [copiedCode, setCopiedCode] = useState<string | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [sendingEmailId, setSendingEmailId] = useState<string | null>(null);

    function handleCopy(code: string) {
        navigator.clipboard.writeText(`${root}/sign-up?id=${code}`)
        setCopiedCode(code)
        toast.success("Link copied to clipboard")
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

            toast.success("Invite deleted");
            await refetch();
        } catch (err) {
            console.error("Failed to delete invite:", err);
            toast.error(err instanceof Error ? err.message : "Failed to delete invite");
        } finally {
            setDeletingId(null);
        }
    }

    async function handleSendEmail(inviteId: string, inviteEmail: string | null | undefined) {
        if (!orgId || !organisation) return;

        if (!inviteEmail) {
            toast.error("No email address associated with this invite");
            return;
        }

        try {
            setSendingEmailId(inviteId);

            // Find an admin API key (ends with "00")
            const adminToken = tokens?.find(token => token.id?.endsWith('00'));

            if (!adminToken?.id) {
                toast.error("No admin API key found. Please create an admin API key first to send invite emails.");
                return;
            }

            const baseUrl = window.location.origin;

            const result = await sendInviteEmail({
                organisationId: orgId,
                inviteId,
                inviterName: session?.user?.firstname || 'Team member',
                organisationName: organisation.name || 'Organization',
                baseUrl,
                logoUrl: organisation.brand?.imageUrl || undefined,
                apiKey: adminToken.id,
            });

            if (!result.success) {
                throw new Error(result.error || "Failed to send email");
            }

            toast.success(`Invite email sent to ${inviteEmail}`);
        } catch (err) {
            console.error("Failed to send invite email:", err);
            toast.error(err instanceof Error ? err.message : "Failed to send invite email");
        } finally {
            setSendingEmailId(null);
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
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className='mb-2'>Active Invite Codes</DialogTitle>
                    <Separator />
                    <DialogDescription>
                        View and manage all active invitation codes for your organisation.
                    </DialogDescription>
                </DialogHeader>

                <div className='pt-4 overflow-x-auto'>
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
                        <div className="border rounded-lg overflow-hidden">
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Invite Code</TableHead>
                                            <TableHead>Email</TableHead>
                                            <TableHead>Role</TableHead>
                                            <TableHead>Uses Left</TableHead>
                                            <TableHead>Created</TableHead>
                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {invites.map((invite) => (
                                            <TableRow key={invite.id}>
                                                <TableCell className="font-mono text-sm whitespace-nowrap">
                                                    {invite.id}
                                                </TableCell>
                                                <TableCell className="text-sm whitespace-nowrap">
                                                    {invite.email ? (
                                                        <span className="text-muted-foreground">{invite.email}</span>
                                                    ) : (
                                                        <span className="text-muted-foreground/50 italic">No email</span>
                                                    )}
                                                </TableCell>
                                                <TableCell className="whitespace-nowrap">
                                                    <Badge variant={extractRoleBadgeVariant(invite.role)}>
                                                        {invite.role?.charAt(0).toUpperCase()}{invite.role?.slice(1)}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="whitespace-nowrap">
                                                    {invite.usesLeft ?? 0}
                                                </TableCell>
                                                <TableCell className="whitespace-nowrap">
                                                    {formatDateByTimeAgo(invite.createdAt)}
                                                </TableCell>
                                                <TableCell className="text-right whitespace-nowrap">
                                                    <div className="flex justify-end gap-2">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleCopy(invite.id as string)}
                                                            disabled={!invite.id}
                                                            title="Copy invite code"
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
                                                            onClick={() => handleSendEmail(invite.id as string, invite.email)}
                                                            disabled={!invite.email || sendingEmailId === invite.id}
                                                            title={invite.email ? "Send invite email" : "No email address"}
                                                        >
                                                            {sendingEmailId === invite.id ? (
                                                                <Loader2Icon className="w-4 h-4 animate-spin" />
                                                            ) : (
                                                                <Mail className="w-4 h-4 text-blue-600" />
                                                            )}
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleDelete(invite.id as string)}
                                                            disabled={deletingId === invite.id || !invite.id}
                                                            title="Delete invite code"
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
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}

export default ActiveInviteCodesDialog
