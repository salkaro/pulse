"use client"

// Local Imports
import MembersTable from './MembersTable'
import AddMemberDialog from './AddMemberDialog'
import { IOrganisation } from '@/models/organisation'
import { useOrganisation } from '@/hooks/useOrganisation'
import ActiveInviteCodesDialog from './ActiveInviteCodesDialog'
import { Skeleton } from '@/components/ui/skeleton'

// External Imports
import { useSession } from 'next-auth/react'
import { levelThreeAccess, levelTwoAccess } from '@/constants/access'
import { Separator } from '@/components/ui/separator'

const Page = () => {
    const { data: session } = useSession();
    const { organisation, loading } = useOrganisation();

    const hasLevelTwoAccess = levelTwoAccess.includes(session?.user.organisation?.role as string);
    const hasLevelThreeAccess = levelThreeAccess.includes(session?.user.organisation?.role as string);

    if (loading) {
        return (
            <div className="space-y-8 mt-4">
                <div className="flex justify-between items-center">
                    <Skeleton className="h-10 w-48" />
                    <Skeleton className="h-10 w-32" />
                </div>
                <Separator className='data-[orientation=horizontal]:h-0.5 ' />
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <Skeleton className="h-10 w-80" />
                        <Skeleton className="h-16 w-32" />
                    </div>
                    <div className="space-y-3">
                        {Array.from({ length: 5 }).map((_, i) => (
                            <Skeleton key={i} className="h-16 w-full" />
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <>
            {hasLevelTwoAccess && (
                <div className='space-y-8 mt-4'>
                    <div className="flex justify-between items-center">
                        {hasLevelThreeAccess && <ActiveInviteCodesDialog orgId={organisation?.id as string} />}
                        {hasLevelThreeAccess && <AddMemberDialog organisation={organisation as IOrganisation} />}
                    </div>
                    <Separator className='data-[orientation=horizontal]:h-0.5 ' />
                    <MembersTable organisation={organisation as IOrganisation} />
                </div>
            )}
        </>
    )
}

export default Page
