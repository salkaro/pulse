import SubmitTicketPage from '@/components/features/submit-ticket/Page'
import { getEntityById } from '@/services/firebase/tickets/create'
import { notFound } from 'next/navigation'
import { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Submit Support Ticket',
    description: 'Submit a support ticket for assistance',
    robots: {
        index: false,
        follow: false,
    },
}

interface PageProps {
    params: {
        entityId: string
    }
}

export default async function Page({ params }: PageProps) {
    const { entityId } = await params

    // Get the entity and organization for this entity ID
    const { organisationId, entityName, error } = await getEntityById({ entityId })

    if (error || !organisationId || !entityName) {
        notFound()
    }

    return (
        <SubmitTicketPage
            organisationId={organisationId}
            entityId={entityId}
            entityName={entityName}
        />
    )
}
