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
import { LucidePlus } from 'lucide-react'
import { apiTokenAccessLevelsName } from '@/constants/access'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'

interface Props {
    disabled?: boolean;
    addToken: (data: { name: string; accessLevel: number }) => Promise<{ error?: boolean }>;
}

const AddAPIKeyDialog: React.FC<Props> = ({ disabled, addToken }) => {
    const [name, setName] = useState('')
    const [open, setOpen] = useState(false);
    const [accessLevel, setAccessLevel] = useState<string>('0')
    const [isSubmitting, setIsSubmitting] = useState(false)

    async function handleSubmit() {
        if (!name.trim()) {
            toast("Name is required", {description: "Please provide all the relavent details to create an API key."})
            return;
        }
        try {
            setIsSubmitting(true)
            const { error } = await addToken({ name: name.trim(), accessLevel: Number(accessLevel) })
            if (error) return;
            toast("API key added", { description: `Successfully added '${name}' as an API key` });
        } catch {
            toast("Failed to add API key:", { description: `An error occured when trying to add '${name}' as an API key. Please try again.` });
        } finally {
            setIsSubmitting(false);
            setOpen(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" disabled={disabled}>
                    <LucidePlus className="w-4 h-4 mr-2" />
                    Generate New
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle className='mb-2'>New API Key</DialogTitle>
                    <Separator />
                    <DialogDescription>
                        Enter a name and select an access level for this API key.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    {/* Name */}
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="key-name" className="text-right">
                            Name
                        </Label>
                        <Input
                            id="key-name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g. Mobile App Key"
                            className="col-span-3"
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
                                {Object.entries(apiTokenAccessLevelsName).map(([level, label]) => (
                                    <SelectItem key={level} value={level}>
                                        {label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <DialogFooter>
                    <Button onClick={handleSubmit} disabled={!name || isSubmitting}>
                        {isSubmitting ? 'Creating...' : 'Create API Key'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export default AddAPIKeyDialog
