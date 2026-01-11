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
import { Check, Copy, LucidePlus } from 'lucide-react'
import { toast } from "sonner"
import { generateInviteCode } from '@/utils/generate'
import { IOrganisation } from '@/models/organisation'
import { createMemberInvite } from '@/services/firebase/create'
import { IMemberInvite } from '@/models/invite'
import { memberLimits } from '@/constants/limits'
import { Separator } from '@/components/ui/separator'
import { OrgRoleType } from '@/constants/access'
import { useOrganisationInvites } from '@/hooks/useOrganisationInvites'

const roleOptions: OrgRoleType[] = ["viewer", "developer", "admin"]

interface Props {
    organisation?: IOrganisation;
    disabled?: boolean;
}


const AddMemberDialog: React.FC<Props> = ({ organisation, disabled }) => {
    const [role, setRole] = useState<string>('viewer');
    const { refetch } = useOrganisationInvites(organisation?.id as string);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [code, setCode] = useState<string | null>(null);
    const [copiedItem, setCopiedItem] = useState<string | null>(null);
    const [uses, setUses] = useState('');

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

    async function handleSubmit() {
        try {
            setIsSubmitting(true)
            const newCode = generateInviteCode();
            setCode(newCode);

            const invite: IMemberInvite = {
                id: newCode,
                orgId: organisation?.id as string,
                usesLeft: Number(uses),
                role,
            }

            const { error } = await createMemberInvite({ invite });
            if (error) throw error;
            await refetch()

            toast.success("Invitation created")
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
                        <div>
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
                                    <Label htmlFor="role">
                                        Uses
                                    </Label>

                                    <Input
                                        id="uses"
                                        type="number"
                                        value={uses}
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
                            {isSubmitting ? 'Generating...' : 'Generate Invitation'}
                        </Button>
                    </DialogFooter>
                )}
            </DialogContent>
        </Dialog>
    )
}

export default AddMemberDialog
