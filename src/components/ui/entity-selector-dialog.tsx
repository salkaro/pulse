"use client"

import { useState } from 'react'
import { IEntity } from '@/models/entity'
import { useEntities } from '@/hooks/useEntities'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Loader2, Store } from 'lucide-react'
import { ProfileImage } from '../icons/icons'

interface EntitySelectorDialogProps {
    organisationId: string | null
    title: string
    description: string
    buttonText: string
    triggerButtonText: string
    triggerButtonIcon?: React.ReactNode
    triggerButtonVariant?: "default" | "outline" | "ghost" | "destructive" | "secondary" | "link"
    filter?: (entity: IEntity) => boolean
    onSelect: (entity: IEntity) => Promise<void> | void
    disabled?: boolean
}

export function EntitySelectorDialog({
    organisationId,
    title,
    description,
    buttonText,
    triggerButtonText,
    triggerButtonIcon,
    triggerButtonVariant = "outline",
    filter,
    onSelect,
    disabled = false,
}: EntitySelectorDialogProps) {
    const { entities, loading: entitiesLoading } = useEntities(organisationId)
    const [isOpen, setIsOpen] = useState(false)
    const [selectedEntityId, setSelectedEntityId] = useState<string | null>(null)
    const [isProcessing, setIsProcessing] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // Filter entities if filter function provided
    const filteredEntities = filter && entities ? entities.filter(filter) : entities || []

    const handleSelect = async () => {
        if (!selectedEntityId) {
            setError("Please select an entity")
            return
        }

        const entity = filteredEntities.find(e => e.id === selectedEntityId)
        if (!entity) {
            setError("Entity not found")
            return
        }

        setIsProcessing(true)
        setError(null)

        try {
            await onSelect(entity)
            setIsOpen(false)
            setSelectedEntityId(null)
        } catch (err) {
            setError(err instanceof Error ? err.message : "An error occurred")
        } finally {
            setIsProcessing(false)
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant={triggerButtonVariant} disabled={disabled}>
                    {triggerButtonIcon}
                    {triggerButtonText}
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>{description}</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                    {entitiesLoading ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                        </div>
                    ) : filteredEntities.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12">
                            <Store className="h-12 w-12 text-muted-foreground mb-4" />
                            <p className="text-sm text-muted-foreground text-center">
                                No entities available
                            </p>
                        </div>
                    ) : (
                        <>
                            <div className="max-h-100 overflow-y-auto pr-2">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {filteredEntities.map((entity) => (
                                        <Card
                                            key={entity.id}
                                            className={`cursor-pointer transition-all hover:border-primary ${selectedEntityId === entity.id
                                                    ? 'border-primary bg-primary/5'
                                                    : 'border-border'
                                                }`}
                                            onClick={() => setSelectedEntityId(entity.id)}
                                        >
                                            <CardContent className="p-4">
                                                <div className="flex items-center gap-3">
                                                    {/* Entity Image or Initials */}
                                                    <ProfileImage image={entity.images?.logo.primary} name={entity.name} />
                                                    {/* Entity Info */}
                                                    <div className="flex-1 min-w-0">
                                                        <h3 className="font-semibold text-sm truncate">
                                                            {entity.name}
                                                        </h3>
                                                        {entity.description && (
                                                            <p className="text-xs text-muted-foreground truncate">
                                                                {entity.description}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            </div>

                            {error && (
                                <div className="p-3 rounded-md bg-destructive/10 text-destructive text-sm">
                                    {error}
                                </div>
                            )}

                            <Button
                                onClick={handleSelect}
                                disabled={!selectedEntityId || isProcessing}
                                className="w-full"
                            >
                                {isProcessing ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Processing...
                                    </>
                                ) : (
                                    buttonText
                                )}
                            </Button>
                        </>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}
