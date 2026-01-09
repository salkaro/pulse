'use client'

import React, { useState } from 'react'
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import { Loader2Icon } from 'lucide-react'
import { withTokenRefresh } from '@/utils/token-refresh'
import { DropdownMenuItem } from '@/components/ui/dropdown-menu'
import { IUser } from '@/models/user'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { levelOneAccess, levelsToIndex, OrgRoleType } from '@/constants/access'
import { updateOrganisationMember } from '@/services/firebase/update'
import { IOrganisation } from '@/models/organisation'
import { useSession } from 'next-auth/react'


interface Props {
    member: IUser;
    organisation: IOrganisation;
    refetch: () => Promise<void>;
}
const UpdateMemberDialog: React.FC<Props> = ({ member, organisation, refetch }) => {
    const { data: session } = useSession();
    const [open, setOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [accessLevel, setAccessLevel] = useState<string>(levelsToIndex[member.organisation?.role as keyof typeof levelsToIndex])

    async function handleSubmit() {
        setIsSubmitting(true);

        try {
            if (member.organisation) {
                member.organisation.role = levelOneAccess[Number(accessLevel)] as OrgRoleType;
                const { error } = await updateOrganisationMember({ member, organisation });
                if (error) throw error
                await refetch();
            }

            toast("Member updated", {
                description: "This member has been successfully updated",
            });

        } catch {
            toast("Failed to update member", {
                description: "Something went wrong while updating this member. Please try again.",
            });
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <>
            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                <div
                    className="w-full cursor-pointer"
                    onClick={() => setOpen(true)}
                >
                    Edit
                </div>
            </DropdownMenuItem>
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className='mb-2'>Update member</DialogTitle>
                        <Separator />
                    </DialogHeader>

                    <div className="grid gap-2">
                        <Label>First Name</Label>
                        <Input
                            type="text"
                            value={member.firstname as string}
                            readOnly
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label>Last Name</Label>
                        <Input
                            type="text"
                            value={member.lastname as string}
                            readOnly
                        />
                    </div>
                    {/* Access Level */}
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="access-level" className="text-right">
                            Access Level
                        </Label>
                        <Select
                            value={accessLevel}
                            onValueChange={setAccessLevel}
                        >
                            <SelectTrigger id="access-level">
                                <SelectValue placeholder="Select level" />
                            </SelectTrigger>
                            <SelectContent>
                                {Object.entries(levelOneAccess.slice(0, Number(levelsToIndex[session?.user?.organisation?.role as keyof typeof levelsToIndex]) + 1)).map(([level, label]) => (
                                    <SelectItem key={level} value={level} className="capitalize">
                                        {label.charAt(0).toUpperCase() + label.slice(1)}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <DialogFooter>
                        <Button onClick={handleSubmit}>
                            {isSubmitting && <Loader2Icon className="animate-spin" />}
                            {isSubmitting ? 'Update...' : 'Update'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    )
}

export default UpdateMemberDialog
