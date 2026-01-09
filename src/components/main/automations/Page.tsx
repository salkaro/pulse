"use client"

import { useState } from 'react'
import Automation from './Automation'
import AddAutomationDialog from './dialogs/AddAutomationDialog'
import { useEntities } from '@/hooks/useEntities'
import { useOrganisation } from '@/hooks/useOrganisation'
import { Skeleton } from '@/components/ui/skeleton'
import FeatureNotIncluded from '@/components/ui/feature-not-included'
import NoEntityFound from '@/components/ui/no-entity-found'

const Page = () => {
    const { organisation } = useOrganisation()
    const { entities, loading } = useEntities(organisation?.id as string)
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [selectedEntityId, setSelectedEntityId] = useState<string | null>(null)

    const handleAddAutomation = (entityId: string) => {
        setSelectedEntityId(entityId)
        setIsDialogOpen(true)
    }

    if (loading) {
        return (
            <div className='flex flex-col w-full gap-4'>
                <Skeleton className="h-32 w-full rounded-lg" />
                <Skeleton className="h-32 w-full rounded-lg" />
            </div>
        )
    }

    if (organisation?.subscription === "free") {
        return <FeatureNotIncluded 
        featureName='Automations' 
        subscriptionRequired='starter'
        features={[
            "Email customers on sign up"
        ]}
        />
    }

    return (
        <>
            <div className='flex flex-col gap-6 mt-8'>
                {entities?.map((entity) => (
                    <Automation
                        key={entity.id}
                        entity={entity}
                        organisationId={organisation?.id ?? null}
                        onAddAutomation={handleAddAutomation}
                    />
                ))}

                {(!entities || entities.length === 0) && (
                    <NoEntityFound />
                )}
            </div>

            <AddAutomationDialog
                open={isDialogOpen}
                onOpenChange={setIsDialogOpen}
                entityId={selectedEntityId}
                organisationId={organisation?.id ?? null}
            />
        </>
    )
}

export default Page
