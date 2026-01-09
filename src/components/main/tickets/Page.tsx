"use client"

import React from 'react'
import { useOrganisation } from '@/hooks/useOrganisation'
import { useEntities } from '@/hooks/useEntities'
import { Skeleton } from '@/components/ui/skeleton'
import NoContent from '@/components/ui/no-content'
import TicketsTable from './TicketsTable'
import Onboarding from './Onboarding'
import Header from './Header'
import { Separator } from '@/components/ui/separator'
import FeatureNotIncluded from '@/components/ui/feature-not-included'

const Page = () => {
    const { organisation, loading: orgLoading } = useOrganisation()
    const { entities, loading: entitiesLoading, refetch } = useEntities(organisation?.id || null)

    // Check if any entities have a ticketId
    const hasTicketEnabled = entities?.some(entity => entity.ticketId)

    const loading = orgLoading || entitiesLoading

    if (loading) {
        return (
            <div className="space-y-4">
                <Skeleton className="h-96 w-full rounded-lg" />
            </div>
        )
    }

    if (!organisation?.id) {
        return <NoContent text="Organisation not found" />
    }

    if (organisation.subscription === "free") {
        return <FeatureNotIncluded 
            featureName='Tickets'
            subscriptionRequired='starter'
            features={[ 
                "Custom Ticket Page",
                "Mange and View Tickets"
            ]}
        />
    }

    // Show onboarding if no entity has tickets enabled
    if (!hasTicketEnabled) {
        return (
            <Onboarding
                organisationId={organisation.id}
                onComplete={refetch}
            />
        )
    }

    // Show tickets table if tickets are enabled
    return (
        <div className="space-y-8 mt-4">
            <Header />
            <Separator className='data-[orientation=horizontal]:h-0.5' />
            <TicketsTable organisationId={organisation.id} />
        </div>
    )
}

export default Page
