"use client"

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog"
import { Card, CardContent } from "@/components/ui/card"
import { toast } from "sonner"
import { AutomationType } from '@/models/automation'
import { Loader2Icon, Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { createAutomation } from '@/services/firebase/automations/create'
import { automationOptions } from '@/constants/platform'
import { removeSessionStorage } from '@/utils/storage-handlers'
import { automationsCookieKey } from '@/constants/cookies'

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    entityId: string | null;
    organisationId: string | null;
    onAutomationCreated?: () => void;
}

const AddAutomationDialog: React.FC<Props> = ({
    open,
    onOpenChange,
    entityId,
    organisationId,
    onAutomationCreated
}) => {
    const [selectedType, setSelectedType] = useState<AutomationType | null>(null)
    const [isLoading, setIsLoading] = useState(false)

    const handleCreate = async () => {
        if (!selectedType || !entityId || !organisationId) {
            toast.error("Please select an automation type")
            return
        }

        setIsLoading(true)
        try {
            const { error } = await createAutomation({
                organisationId,
                entityId,
                type: selectedType,
            })

            if (error) {
                throw new Error(error)
            }

            // Clear session storage cache for this entity's automations
            const storageKey = `${organisationId}_${entityId}_${automationsCookieKey}`
            removeSessionStorage(storageKey)

            toast.success('Automation created successfully')
            onOpenChange(false)
            setSelectedType(null)
            onAutomationCreated?.()
        } catch (error) {
            console.error('Error creating automation:', error)
            toast.error(error instanceof Error ? error.message : 'Failed to create automation')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Add Automation</DialogTitle>
                    <DialogDescription>
                        Select an automation type to add to this entity
                    </DialogDescription>
                </DialogHeader>

                <div className="max-h-100 overflow-y-auto pr-4">
                    <div className="space-y-3 py-4">
                        {automationOptions.map((option) => {
                            const Icon = option.icon;
                            return (
                                <Card
                                    key={option.type}
                                    className={cn(
                                        "cursor-pointer transition-all hover:shadow-md",
                                        selectedType === option.type
                                            ? "border-primary ring-2 ring-primary/20"
                                            : "hover:border-muted-foreground/50"
                                    )}
                                    onClick={() => !isLoading && setSelectedType(option.type)}
                                >
                                    <CardContent className="flex items-center gap-4 p-4">
                                        <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-muted">
                                            <Icon className='w-6 h-6'/>
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-medium">{option.name}</h4>
                                            <p className="text-xs text-muted-foreground mt-1">
                                                {option.description}
                                            </p>
                                        </div>
                                        {selectedType === option.type && (
                                            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 shrink-0">
                                                <Check className="w-4 h-4 text-primary" />
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            )
                        })}
                    </div>
                </div>

                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={() => {
                            onOpenChange(false)
                            setSelectedType(null)
                        }}
                        disabled={isLoading}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleCreate}
                        disabled={isLoading || !selectedType}
                    >
                        {isLoading && <Loader2Icon className="w-4 h-4 mr-2 animate-spin" />}
                        {isLoading ? "Creating..." : "Create Automation"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export default AddAutomationDialog
