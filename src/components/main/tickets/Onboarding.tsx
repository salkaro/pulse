"use client"

import React, { useState } from 'react'
import { useEntities } from '@/hooks/useEntities'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { TicketIcon, Loader2, CheckCircle2, ExternalLink } from 'lucide-react'
import { updateEntity } from '@/services/firebase/entities/update'
import { Badge } from '@/components/ui/badge'

interface OnboardingProps {
    organisationId: string
    onComplete: () => void
}

const Onboarding: React.FC<OnboardingProps> = ({ organisationId, onComplete }) => {
    const { entities, loading: entitiesLoading, refetch } = useEntities(organisationId)
    const [selectedEntityId, setSelectedEntityId] = useState<string>("")
    const [isGenerating, setIsGenerating] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleGenerateTicketPage = async () => {
        if (!selectedEntityId) {
            setError("Please select an entity")
            return
        }

        setIsGenerating(true)
        setError(null)

        try {
            // Generate a unique ticket ID
            const ticketId = `ticket_${Date.now()}_${Math.random().toString(36).substring(7)}`

            // Update the entity with the ticketId
            const { success, error: updateError } = await updateEntity({
                organisationId,
                entityId: selectedEntityId,
                ticketId,
            })

            if (updateError || !success) {
                throw new Error(updateError || "Failed to update entity")
            }

            // Refetch entities to get updated data
            await refetch()

            // Complete onboarding
            onComplete()
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to generate ticket page")
        } finally {
            setIsGenerating(false)
        }
    }

    return (
        <div className="flex items-center justify-center min-h-[60vh] p-4">
            <Card className="w-full max-w-2xl">
                <CardHeader className="text-center">
                    <div className="flex justify-center mb-4">
                        <div className="p-4 rounded-full bg-purple-500/10">
                            <TicketIcon className="w-12 h-12 text-purple-500" />
                        </div>
                    </div>
                    <CardTitle className="text-2xl">Welcome to Tickets</CardTitle>
                    <CardDescription className="text-base">
                        Create a dedicated page where your customers can submit support tickets directly.
                        Track issues, manage customer requests, and provide better support.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-2">
                        <h3 className="font-semibold">How it works:</h3>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li className="flex items-start gap-2">
                                <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                                <span>Generate a unique ticket submission page for your entity</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                                <span>Customers can submit tickets with their details and issue description</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                                <span>View, filter, and manage all tickets in one central dashboard</span>
                            </li>
                        </ul>
                    </div>

                    <div className="space-y-3">
                        <label className="text-sm font-medium">Select an entity to get started:</label>
                        {entitiesLoading ? (
                            <div className="flex items-center justify-center py-4">
                                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                            </div>
                        ) : entities && entities.length > 0 ? (
                            <Select value={selectedEntityId} onValueChange={setSelectedEntityId}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Choose an entity..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {entities.map((entity) => (
                                        <SelectItem key={entity.id} value={entity.id}>
                                            <div className="flex items-center gap-2">
                                                <span>{entity.name}</span>
                                                {entity.ticketId && (
                                                    <Badge variant="secondary" className="text-xs">
                                                        Has ticket page
                                                    </Badge>
                                                )}
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        ) : (
                            <p className="text-sm text-muted-foreground text-center py-4">
                                No entities found. Please create an entity first.
                            </p>
                        )}
                    </div>

                    {error && (
                        <div className="p-3 rounded-md bg-destructive/10 text-destructive text-sm">
                            {error}
                        </div>
                    )}

                    <Button
                        onClick={handleGenerateTicketPage}
                        disabled={!selectedEntityId || isGenerating || entitiesLoading}
                        className="w-full"
                        size="lg"
                    >
                        {isGenerating ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Generating ticket page...
                            </>
                        ) : (
                            <>
                                <ExternalLink className="mr-2 h-4 w-4" />
                                Generate Ticket Page
                            </>
                        )}
                    </Button>
                </CardContent>
            </Card>
        </div>
    )
}

export default Onboarding
