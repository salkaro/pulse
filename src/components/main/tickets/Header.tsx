"use client"

import { useState } from 'react'
import { useOrganisation } from '@/hooks/useOrganisation'
import { useEntities } from '@/hooks/useEntities'
import { Button } from '@/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ExternalLink, Copy, Check, Plus } from 'lucide-react'
import { updateEntity } from '@/services/firebase/entities/update'
import { EntitySelectorDialog } from '@/components/ui/entity-selector-dialog'
import { IEntity } from '@/models/entity'

const Header = () => {
    const { organisation } = useOrganisation()
    const { entities, refetch } = useEntities(organisation?.id || null)

    // For copy animation
    const [copiedId, setCopiedId] = useState<string | null>(null)

    // Get entities with tickets
    const entitiesWithTickets = entities?.filter(entity => entity.ticketId) || []

    const getTicketUrl = (entityId: string) => {
        if (typeof window !== 'undefined') {
            return `${window.location.origin}/submit-ticket/${entityId}`
        }
        return `/submit-ticket/${organisation?.id}`
    }

    const handleCopy = async (entityId: string) => {
        const url = getTicketUrl(entityId)
        await navigator.clipboard.writeText(url)
        setCopiedId(entityId)
        setTimeout(() => setCopiedId(null), 2000)
    }

    const handleCreateTicketPage = async (entity: IEntity) => {
        if (!organisation?.id) {
            throw new Error("Organisation not found")
        }

        // Generate a unique ticket ID
        const ticketId = `ticket_${Date.now()}_${Math.random().toString(36).substring(7)}`

        // Update the entity with the ticketId
        const { success, error: updateError } = await updateEntity({
            organisationId: organisation.id,
            entityId: entity.id,
            ticketId,
        })

        if (updateError || !success) {
            throw new Error(updateError || "Failed to create ticket page")
        }

        // Refetch entities to get updated data
        await refetch()
    }

    return (
        <div className="flex items-center justify-between">
            <div>
                {/* Create New Ticket Page Dialog */}
                <EntitySelectorDialog
                    organisationId={organisation?.id || null}
                    title="Create New Ticket Page"
                    description="Select an entity to generate a ticket submission page for it."
                    buttonText="Create Ticket Page"
                    triggerButtonText="Create Ticket Page"
                    triggerButtonIcon={<Plus className="mr-2 h-4 w-4" />}
                    triggerButtonVariant="outline"
                    filter={(entity) => !entity.ticketId}
                    onSelect={handleCreateTicketPage}
                />
            </div>
            <div className="flex items-center gap-3">
                {/* Ticket URLs Dropdown */}
                {entitiesWithTickets.length > 0 && (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button>
                                <ExternalLink className="mr-2 h-4 w-4" />
                                Ticket Links
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-80">
                            <DropdownMenuLabel>Ticket Submission Pages</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            {entitiesWithTickets.map((entity) => (
                                <DropdownMenuItem
                                    key={entity.id}
                                    className="flex items-center justify-between cursor-pointer"
                                    onSelect={(e) => e.preventDefault()}
                                >
                                    <div className="flex flex-col gap-1 flex-1 min-w-0">
                                        <span className="font-medium text-sm">{entity.name}</span>
                                        <span className="text-xs text-muted-foreground truncate">
                                            {getTicketUrl(entity.id!)}
                                        </span>
                                    </div>
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        className="ml-2 h-8 w-8 p-0"
                                        onClick={() => handleCopy(entity.id!)}
                                    >
                                        {copiedId === entity.id ? (
                                            <Check className="h-4 w-4 text-green-500" />
                                        ) : (
                                            <Copy className="h-4 w-4" />
                                        )}
                                    </Button>
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>
                )}
            </div>
        </div>
    )
}

export default Header
