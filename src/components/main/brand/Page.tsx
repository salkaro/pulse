"use client"

// Local Imports
import { useEntities } from '@/hooks/useEntities'
import { useOrganisation } from '@/hooks/useOrganisation'
import { Skeleton } from '@/components/ui/skeleton'
import NoEntityFound from '@/components/ui/no-entity-found'
import BrandCard from './BrandCard'

const Page = () => {
    const { organisation } = useOrganisation()
    const { entities, loading } = useEntities(organisation?.id ?? null)

    if (loading) {
        return (
            <div className="space-y-6 p-4">
                <div>
                    <Skeleton className="h-8 w-48 mb-2" />
                    <Skeleton className="h-4 w-96" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <Skeleton key={i} className="h-48 w-full" />
                    ))}
                </div>
            </div>
        )
    }

    if (!entities || entities.length === 0) {
        return (
            <NoEntityFound />
        )
    }

    return (
        <div className="space-y-6 p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {entities.map((entity) => (
                    <BrandCard key={entity.id} entity={entity} />
                ))}
            </div>
        </div>
    )
}

export default Page
