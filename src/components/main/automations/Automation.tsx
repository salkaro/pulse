"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { IEntity } from '@/models/entity'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAutomations } from '@/hooks/useAutomations'
import { Skeleton } from '@/components/ui/skeleton'
import { useState } from 'react'
import { automationOptions } from '@/constants/platform'
import { IAutomation } from '@/models/automation'
import EmailOnSignUpDialog from './dialogs/EmailOnSignUpDialog'
import { ProfileImage } from '@/components/icons/icons'

interface Props {
    entity: IEntity;
    organisationId: string | null;
    onAddAutomation: (entityId: string) => void;
}

const Automation: React.FC<Props> = ({ entity, organisationId, onAddAutomation }) => {
    const { automations, loading, refetch } = useAutomations(organisationId, entity.id)
    const [selectedAutomation, setSelectedAutomation] = useState<IAutomation | null>(null)
    const [isDialogOpen, setIsDialogOpen] = useState(false)

    // Check if all automation types have been configured
    const configuredTypes = new Set(automations?.map(a => a.type) ?? [])
    const availableAutomationTypes = automationOptions.filter(
        option => !configuredTypes.has(option.type)
    )
    const hasAvailableAutomations = availableAutomationTypes.length > 0


    async function handleAddAutomation() {
        await refetch();
        onAddAutomation(entity.id);
    }

    const getAutomationDetails = (type: string) => {
        const option = automationOptions.find(opt => opt.type === type)
        if (option) {
            const Icon = option.icon
            return {
                icon: <Icon className={`w-5 h-5 ${option.color}`} />,
                name: option.name,
                color: option.color
            }
        }
        return {
            icon: null,
            name: type,
            color: 'text-muted-foreground'
        }
    }

    const handleAutomationClick = (automation: IAutomation) => {
        setSelectedAutomation(automation)
        setIsDialogOpen(true)
    }

    if (loading) {
        return (
            <div className='flex flex-row items-center gap-6'>
                <Skeleton className="h-40 w-70 rounded-lg" />
                <Skeleton className="h-8 w-8 rounded" />
                <Skeleton className="h-16 w-16 rounded-full" />
            </div>
        )
    }

    return (
        <div className='flex flex-row items-center flex-wrap'>
            <Card className="min-w-70 shadow-sm hover:shadow-md transition-shadow">
                <CardHeader>
                    <CardTitle className='flex items-center gap-4'>
                        <ProfileImage image={entity.images?.logo.primary} name={entity.name} />
                        {entity.name}
                    </CardTitle>
                    {entity.description && (
                        <CardDescription>{entity.description}</CardDescription>
                    )}
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground">
                        {automations && automations.length > 0
                            ? `${automations.length} automation${automations.length > 1 ? 's' : ''} configured`
                            : 'No automations configured'}
                    </p>
                </CardContent>
            </Card>

            {/* Connecting line - only show if there are automations or available slots */}
            {(automations && automations.length > 0) || hasAvailableAutomations ? (
                <div className="h-0.5 w-12 bg-border shrink-0" />
            ) : null}

            {/* Display existing automations */}
            {automations?.map((automation) => {
                const details = getAutomationDetails(automation.type)
                return (
                    <div key={automation.id} className="flex items-center">
                        <Card
                            className="min-w-60 shadow-sm hover:shadow-md transition-all cursor-pointer hover:border-primary/50"
                            onClick={() => handleAutomationClick(automation)}
                        >
                            <CardContent className="flex items-center gap-3 p-4">
                                <div className={`flex items-center justify-center w-10 h-10 rounded-lg bg-linear-to-br from-muted to-muted/50`}>
                                    {details.icon}
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-medium text-sm">{details.name}</h4>
                                    <p className="text-xs text-muted-foreground">
                                        {automation.lastUsed
                                            ? `Last used ${new Date(automation.lastUsed).toLocaleDateString()}`
                                            : 'Never used'}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                        {/* Connecting line after automation card - only if more automations can be added */}
                        {hasAvailableAutomations && <div className="h-0.5 w-12 bg-border shrink-0" />}
                    </div>
                )
            })}

            {/* Add automation button - only show if there are available automations */}
            {hasAvailableAutomations && (
                <Button
                    onClick={() => handleAddAutomation()}
                    size="icon"
                    className="h-16 w-16 rounded-full shrink-0 shadow-sm hover:shadow-md transition-all hover:scale-105"
                    variant="outline"
                >
                    <Plus className="h-8 w-8" />
                </Button>
            )}

            {/* Automation Configuration Dialog */}
            {selectedAutomation && selectedAutomation.type === 'email-on-sign-up' && (
                <EmailOnSignUpDialog
                    open={isDialogOpen}
                    onOpenChange={setIsDialogOpen}
                    automationId={selectedAutomation.id}
                    entityName={entity.name}
                    organisationId={organisationId}
                    entityId={entity.id}
                />
            )}
        </div>
    )
}

export default Automation
