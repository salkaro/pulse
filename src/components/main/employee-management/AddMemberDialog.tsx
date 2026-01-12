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
    DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from "@/components/ui/select"
import { Check, Copy, LucidePlus, X } from 'lucide-react'
import { toast } from "sonner"
import { generateInviteCode } from '@/utils/generate'
import { IOrganisation } from '@/models/organisation'
import { createMemberInvite } from '@/services/firebase/create'
import { IMemberInvite } from '@/models/invite'
import { memberLimits } from '@/constants/limits'
import { Separator } from '@/components/ui/separator'
import { OrgRoleType } from '@/constants/access'
import { useOrganisationInvites } from '@/hooks/useOrganisationInvites'
import { useTokens } from '@/hooks/useTokens'
import { sendInviteEmail } from '@/services/pulse/send-invite-email'
import { useSession } from 'next-auth/react'
import { Badge } from '@/components/ui/badge'

const roleOptions: OrgRoleType[] = ["viewer", "developer", "admin"]

interface Props {
    organisation?: IOrganisation;
    disabled?: boolean;
}


const AddMemberDialog: React.FC<Props> = ({ organisation, disabled }) => {
    const [role, setRole] = useState<string>('viewer');
    const { refetch } = useOrganisationInvites(organisation?.id as string);
    const { tokens } = useTokens(organisation?.id as string);
    const { data: session } = useSession();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [code, setCode] = useState<string | null>(null);
    const [copiedItem, setCopiedItem] = useState<string | null>(null);
    const [uses, setUses] = useState('');
    const [emails, setEmails] = useState<string[]>([]);
    const [emailInput, setEmailInput] = useState('');

    let memberLimit = 0;
    let maxMemberCountHit = true;
    if (organisation) {
        memberLimit = memberLimits[organisation?.subscription as keyof typeof memberLimits]
        maxMemberCountHit = organisation.members !== -1 && (organisation.members ?? 0) >= memberLimit;
    }

    const roleInfo = {
        "viewer": "Can view data and dashboard, but cannot make any changes.",
        "developer": "Can read data and add api keys, but cannot edit organisation data or employees.",
        "admin": "Full access to the organisation and entities",
    };

    function handleAddEmail() {
        const trimmedEmail = emailInput.trim().toLowerCase();

        if (!trimmedEmail) return;

        // Basic email validation
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
            toast.error("Please enter a valid email address");
            return;
        }

        if (emails.includes(trimmedEmail)) {
            toast.error("Email already added");
            return;
        }

        const newEmails = [...emails, trimmedEmail];
        setEmails(newEmails);
        setUses(String(newEmails.length));
        setEmailInput('');
    }

    function handleRemoveEmail(emailToRemove: string) {
        const newEmails = emails.filter(e => e !== emailToRemove);
        setEmails(newEmails);
        setUses(newEmails.length > 0 ? String(newEmails.length) : '');
    }

    function handleEmailKeyPress(e: React.KeyboardEvent<HTMLInputElement>) {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleAddEmail();
        }
    }

    async function handleSubmit() {
        try {
            setIsSubmitting(true);

            // Find admin API key if emails are provided
            let adminToken = null;
            if (emails.length > 0) {
                adminToken = tokens?.find(token => token.id?.endsWith('00'));
                if (!adminToken?.id) {
                    toast.error("No admin API key found. Please create an admin API key first to send invite emails.");
                    setIsSubmitting(false);
                    return;
                }
            }

            // Create invites for each email (or one invite if no emails)
            const invitesToCreate = emails.length > 0 ? emails : [null];
            const createdCodes: string[] = [];

            // Calculate uses per email - divide total uses by number of emails
            const usesPerInvite = emails.length > 0
                ? Math.floor(Number(uses) / emails.length)
                : Number(uses);

            for (const email of invitesToCreate) {
                const newCode = generateInviteCode();
                createdCodes.push(newCode);

                const invite: IMemberInvite = {
                    id: newCode,
                    orgId: organisation?.id as string,
                    usesLeft: usesPerInvite,
                    role,
                    email: email,
                }

                const { error } = await createMemberInvite({ invite });
                if (error) throw error;

                // Send email if this invite has an email and we have an admin token
                if (email && adminToken?.id) {
                    const baseUrl = window.location.origin;

                    const result = await sendInviteEmail({
                        organisationId: organisation?.id as string,
                        inviteId: newCode,
                        inviterName: session?.user?.firstname || 'Team member',
                        organisationName: organisation?.name || 'Organization',
                        baseUrl,
                        logoUrl: organisation?.brand?.imageUrl || undefined,
                        apiKey: adminToken.id,
                    });

                    if (!result.success) {
                        console.error(`Failed to send email to ${email}:`, result.error);
                        toast.warning(`Invite created but email to ${email} failed to send`);
                    }
                }
            }

            await refetch();

            if (emails.length > 0) {
                toast.success(`${emails.length} invitation(s) created and sent`);
            } else {
                toast.success("Invitation created");
                setCode(createdCodes[0]);
            }

            // Reset form
            setEmails([]);
            setEmailInput('');

            // Only show code if no emails (manual sharing)
            if (emails.length === 0) {
                setCode(createdCodes[0]);
            }
        } catch (err) {
            console.error("Failed to create invitation:", err)
            toast.error("Failed to create invitation")
        } finally {
            setIsSubmitting(false)
        }
    }

    function handleCopy(value: string, label: string) {
        navigator.clipboard.writeText(value)
        setCopiedItem(label)
        setTimeout(() => setCopiedItem(null), 2000)
    }

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" disabled={disabled || maxMemberCountHit}>
                    <LucidePlus className="w-4 h-4 mr-2" />
                    Add Member
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle className='mb-2'>Invite New Member</DialogTitle>
                    <Separator />
                    <DialogDescription>
                        Generate a verification code with role access.
                    </DialogDescription>
                </DialogHeader>

                <div className='pt-4'>
                    {/* Role */}
                    {!code && (
                        <div className='space-y-4'>
                            <div className='grid gap-3'>
                                <Label htmlFor="email">
                                    Email Addresses (optional)
                                </Label>
                                <div className="flex gap-2">
                                    <Input
                                        id="email"
                                        type="email"
                                        value={emailInput}
                                        onChange={(e) => setEmailInput(e.target.value)}
                                        onKeyDown={handleEmailKeyPress}
                                        placeholder="member@example.com"
                                    />
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={handleAddEmail}
                                        disabled={!emailInput.trim()}
                                    >
                                        Add
                                    </Button>
                                </div>
                                {emails.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {emails.map((email) => (
                                            <Badge key={email} variant="secondary" className="flex items-center gap-1">
                                                {email}
                                                <X
                                                    className="w-3 h-3 cursor-pointer hover:text-destructive"
                                                    onClick={() => handleRemoveEmail(email)}
                                                />
                                            </Badge>
                                        ))}
                                    </div>
                                )}
                                <p className="text-xs text-muted-foreground">
                                    {emails.length > 0
                                        ? `${emails.length} email(s) added - invitations will be sent automatically`
                                        : 'Add emails to send invitation links directly, or leave empty to generate a code for manual sharing'}
                                </p>
                            </div>

                            <div className='grid grid-rows-2 sm:grid-cols-2 sm:grid-rows-1 gap-6 sm:grid-0'>
                                <div className='flex flex-row gap-6 items-center'>
                                    <Label htmlFor="role">
                                        Role
                                    </Label>
                                    <Select value={role} onValueChange={setRole}>
                                        <SelectTrigger id="role">
                                            <SelectValue placeholder="Select role" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {roleOptions.map((role) => (
                                                <SelectItem key={role} value={role}>
                                                    {role.charAt(0).toUpperCase() + role.slice(1)}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className='flex flex-row gap-6 items-center'>
                                    <Label htmlFor="uses">
                                        Uses
                                    </Label>

                                    <Input
                                        id="uses"
                                        type="number"
                                        value={uses}
                                        disabled={!!emails}
                                        min={1}
                                        max={memberLimit}
                                        onChange={(e) => {
                                            const value = parseInt(e.target.value, 10);
                                            if (isNaN(value)) {
                                                setUses('');
                                            } else if (value <= memberLimit) {
                                                setUses(String(value));
                                            }
                                        }}
                                        placeholder={`Max ${memberLimit}`}
                                    />
                                </div>
                            </div>
                            <div className='text-sm text-muted-foreground mt-6 grid grid-cols-12 px-2 items-center'>
                                <div className='col-span-1 text-2xl pb-1'>•</div>
                                <div className='col-span-11'>{roleInfo[role as keyof typeof roleInfo]}</div>
                            </div>
                        </div>
                    )}



                    {/* Code + Link display */}
                    {code && (
                        <div className="col-span-4 space-y-3">
                            {/* Copy Code */}
                            <div className="flex items-center justify-between">
                                <Input className="text-sm break-all" value={code} readOnly />
                                <div className="flex space-x-2">
                                    <Button variant="ghost" size="sm" onClick={() => handleCopy(code, "Code")}>
                                        {copiedItem === "Code" ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                    </Button>
                                </div>
                            </div>

                            {/* Copy Link 
                            <div className="flex items-center justify-between">
                                <Input className="text-sm break-all" value={`${JOIN_LINK_BASE}?code=${code}`} readOnly />
                                <div className="flex space-x-2">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() =>
                                            handleCopy(`${JOIN_LINK_BASE}?code=${code}`, "Link")
                                        }
                                    >
                                        {copiedItem === "Link" ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                    </Button>
                                </div>
                            </div>
                            */}
                        </div>
                    )}
                </div>

                {!code && (
                    <DialogFooter>
                        <Button onClick={handleSubmit} disabled={isSubmitting}>
                            {isSubmitting ? 'Processing...' : emails.length > 0 ? `Send ${emails.length} Invitation${emails.length > 1 ? 's' : ''}` : 'Generate Invitation'}
                        </Button>
                    </DialogFooter>
                )}
            </DialogContent>
        </Dialog>
    )
}

export default AddMemberDialog
