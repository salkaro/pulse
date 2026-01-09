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

const Page = () => {
    const { data: session } = useSession()
    const { organisation } = useOrganisation()
    const { domains, refetch } = useDomains(organisation?.id ?? null)
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
    const [selectedDomain, setSelectedDomain] = useState<IDomain | null>(null)

    const subscription = organisation?.subscription ?? 'free'
    const limit = domainLimits[subscription as keyof typeof domainLimits]
    const canAddDomain = limit === -1 || (domains?.length ?? 0) < limit

    const handleViewDomain = (domain: IDomain) => {
        setSelectedDomain(domain)
    }

    const handleDomainCreated = async () => {
        await refetch()
    }

    if (limit === 0) {
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

    return (
        <div className="space-y-6 mt-8">
            <div className="flex items-center justify-between">
                <Button
                    onClick={() => setIsAddDialogOpen(true)}
                    disabled={!canAddDomain}
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Domain
                </Button>
            </div>

            <DomainsTable
                organisationId={organisation?.id ?? ''}
                onViewDomain={handleViewDomain}
            />

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

            {selectedDomain && (
                <DomainDetailsDialog
                    open={!!selectedDomain}
                    onOpenChange={(open: boolean) => !open && setSelectedDomain(null)}
                    domain={selectedDomain}
                    organisationId={organisation?.id ?? null}
                />
            )}
        </div>
    )
}

export default Page
