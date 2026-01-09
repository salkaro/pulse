"use client"

// Local Imports
import NoContent from '@/components/ui/no-content'
import { Skeleton } from '@/components/ui/skeleton'
import CustomersTable from './CustomersTable'
import { useOrganisation } from '@/hooks/useOrganisation'

// External Imports

const Page = () => {
    const { organisation, loading } = useOrganisation();

    if (loading) {
        return (
            <div className="space-y-4">
                <Skeleton className="h-96 w-full rounded-lg" />
            </div>
        );
    }

    if (!organisation?.id) {
        return <NoContent text="Organisation not found" />;
    }

    return (
        <div className="space-y-4">
            <CustomersTable organisationId={organisation.id} />
        </div>
    )
}

export default Page
