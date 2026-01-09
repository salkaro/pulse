"use client"

// Local Imports
import NoContent from '@/components/ui/no-content'
import { Skeleton } from '@/components/ui/skeleton'
import PaymentsTable from './PaymentsTable'
import RecurringRevenueChart from './RecurringRevenueChart'
import OneTimeRevenueChart from './OneTimeRevenueChart'
import { useOrganisation } from '@/hooks/useOrganisation'
import { useCharges } from '@/hooks/useCharges'
import { useConnections } from '@/hooks/useConnections'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { formatDateRange } from '@/utils/formatters'
import { FilterLongType } from '@/constants/filters'

// External Imports
import { useState, useMemo } from 'react'
import { useEntities } from '@/hooks/useEntities'
import NoEntityFound from '@/components/ui/no-entity-found'


const Page = () => {
    const { organisation, loading } = useOrganisation();
    const { entities, loading: loadingEntities } = useEntities(organisation?.id as string);
    const { connections, loading: loadingConnections } = useConnections(organisation?.id ?? null);
    const [filter, setFilter] = useState<FilterLongType>('all');

    // Calculate date range based on filter
    const dateRange = useMemo(() => formatDateRange(filter), [filter]);

    const { chargesByConnection, loading: loadingCharges } = useCharges(
        filter === 'all'
            ? organisation?.id ?? null
            : { organisationId: organisation?.id ?? null, ...dateRange }
    );

    if (loading || loadingConnections) {
        return (
            <div className="space-y-6">
                <Skeleton className="h-9 w-80 rounded-lg" />
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <Skeleton className="h-80 w-full rounded-lg" />
                    <Skeleton className="h-80 w-full rounded-lg" />
                </div>
                <Skeleton className="h-96 w-full rounded-lg" />
            </div>
        );
    }

    if (!organisation?.id) {
        return <NoContent text="Organisation not found" />;
    }

    if (!loadingEntities && entities && entities.length === 0) {
        return <NoEntityFound />
    }


    return (
        <div className="space-y-8 mt-3">
            {/* Header with Filters */}
            <Tabs value={filter} onValueChange={(value) => setFilter(value as FilterLongType)}>
                <TabsList>
                    <TabsTrigger value="all">All</TabsTrigger>
                    <TabsTrigger value="monthly">Monthly</TabsTrigger>
                    <TabsTrigger value="quarterly">Quarterly</TabsTrigger>
                    <TabsTrigger value="yearly">Yearly</TabsTrigger>
                </TabsList>
            </Tabs>
            <Separator className='data-[orientation=horizontal]:h-0.5 ' />

            {/* Charts */}
            {loadingCharges ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <Skeleton className="h-80 w-full rounded-lg" />
                    <Skeleton className="h-80 w-full rounded-lg" />
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <RecurringRevenueChart chargesByConnection={chargesByConnection ?? {}} connections={connections ?? []} />
                    <OneTimeRevenueChart chargesByConnection={chargesByConnection ?? {}} connections={connections ?? []} />
                </div>
            )}

            {/* Payments Table */}
            <PaymentsTable organisationId={organisation.id} />
        </div>
    )
}

export default Page
