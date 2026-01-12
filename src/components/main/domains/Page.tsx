"use client"

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useOrganisation } from '@/hooks/useOrganisation'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import DomainsTable from './DomainsTable'
import AddDomainDialog from './dialogs/AddDomainDialog'
import { IDomain } from '@/models/domain'
import DomainDetailsDialog from './dialogs/DomainDetailsDialog'
import { domainLimits } from '@/constants/limits'
import { useDomains } from '@/hooks/useDomains'
import LimitReached from '@/components/ui/limit-reached'
import FeatureNotIncluded from '@/components/ui/feature-not-included'
import { Skeleton } from '@/components/ui/skeleton'
import { levelTwoAccess } from '@/constants/access'
import { Separator } from '@/components/ui/separator'

const Page = () => {
    const { data: session } = useSession()
    const { organisation, loading: loadingOrganisation } = useOrganisation()
    const { domains, refetch, loading: loadingDomains } = useDomains(organisation?.id ?? null)
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
    const [selectedDomain, setSelectedDomain] = useState<IDomain | null>(null)

    const subscription = organisation?.subscription ?? 'free'
    const limit = domainLimits[subscription as keyof typeof domainLimits]
    const canAddDomain = limit === -1 || (domains?.length ?? 0) < limit
    const hasEditAccess = levelTwoAccess.includes(session?.user.organisation?.role as string)

    const handleViewDomain = (domain: IDomain) => {
        setSelectedDomain(domain)
    }

    const handleDomainCreated = async () => {
        await refetch()
    }

    // Check if feature is not included first (before showing loading state)
    if (!loadingOrganisation && limit === 0) {
        return (
            <FeatureNotIncluded
                featureName='Domains'
                subscriptionRequired='starter'
                features={[
                    "Add custom domains",
                    "Use domains to email customers",
                    "Custom ticket domain"
                ]}
            />
        )
    }

    if (loadingOrganisation || loadingDomains) {
        return (
            <div className="space-y-6 mt-8">
                <div className="flex items-center justify-between">
                    <Skeleton className="h-10 w-32" />
                </div>
                <DomainsTable
                    organisationId={organisation?.id ?? ''}
                    onViewDomain={handleViewDomain}
                />
            </div>
        )
    }

    return (
        <div className="space-y-6 mt-8">
            {hasEditAccess && (
                <div className="flex items-center justify-between">
                    <Button
                        onClick={() => setIsAddDialogOpen(true)}
                        disabled={!canAddDomain}
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Domain
                    </Button>
                </div>
            )}

            {hasEditAccess && (
                <Separator className='data-[orientation=horizontal]:h-0.5 ' />
            )}

            <DomainsTable
                organisationId={organisation?.id ?? ''}
                onViewDomain={handleViewDomain}
                canEdit={hasEditAccess}
            />

            {hasEditAccess && (
                <>
                    <AddDomainDialog
                        open={isAddDialogOpen}
                        onOpenChange={setIsAddDialogOpen}
                        organisationId={organisation?.id ?? null}
                        userId={session?.user?.id ?? null}
                        onDomainCreated={handleDomainCreated}
                    />

                    {!canAddDomain && (
                        <LimitReached type="domains" limit={limit} />
                    )}
                </>
            )}

            {selectedDomain && (
                <DomainDetailsDialog
                    open={!!selectedDomain}
                    onOpenChange={(open: boolean) => !open && setSelectedDomain(null)}
                    domain={selectedDomain}
                    organisationId={organisation?.id ?? null}
                    canEdit={hasEditAccess}
                />
            )}
        </div>
    )
}

export default Page
