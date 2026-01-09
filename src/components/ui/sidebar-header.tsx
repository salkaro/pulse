// Local Imports
import { SidebarMenuButton } from './sidebar'
import { useOrganisation } from '@/hooks/useOrganisation'
import { useEntities } from '@/hooks/useEntities'
import { entityLimits } from '@/constants/limits'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from './dropdown-menu'

// External Imports
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { ChevronsUpDown, Plus, Store } from 'lucide-react'
import React from 'react'
import Image from 'next/image'


const SidebarHeader = () => {
    const { data: session } = useSession();
    const { organisation, loading } = useOrganisation();
    const { entities, loading: loadingEntities } = useEntities(organisation?.id ?? null);

    const subscriptionTier = organisation?.subscription ?? "free";
    const entityLimit = entityLimits[subscriptionTier as keyof typeof entityLimits];
    const currentEntityCount = organisation?.entities ?? 0;
    const canAddEntity = entityLimit === -1 || currentEntityCount < entityLimit;

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                    size="lg"
                    variant="outline"
                    className="
                        bg-background text-sidebar-accent-foreground rounded-xl p-1 border
                        flex items-center gap-2
                        group-data-[collapsible=icon]:border-0
                        group-data-[collapsible=icon]:justify-center
                        group-data-[collapsible=icon]:mt-1
                    "

                >
                    {/* ICON */}
                    {organisation?.brand?.imageUrl ? (
                        <Image
                            src={organisation?.brand?.imageUrl}
                            alt="Brand Image"
                            width={500}
                            height={500}
                            className='size-9 rounded-lg'
                        />
                    ) : (
                        <div className="
                        text-sidebar-primary
                        flex aspect-square size-9 items-center justify-center rounded-lg
                    "
                        >
                            <Store className="h-5 w-5" />
                        </div>

                    )}

                    {/* TEXT — fully removed when collapsed */}
                    <div className="
                        grid text-left text-sm leading-tight
                        group-data-[collapsible=icon]:hidden
                    "
                    >
                        <span className="truncate font-medium text-xs text-muted-foreground">
                            {session?.user.firstname} {session?.user.lastname}
                        </span>
                        <span className="truncate text-sm font-semibold">
                            {loading ? "..." : (organisation?.name ?? session?.user.firstname)}
                        </span>
                    </div>

                    {/* SPACER */}
                    <div className="flex-1 group-data-[collapsible=icon]:hidden" />

                    {/* CHEVRON */}
                    <ChevronsUpDown className="text-muted-foreground mr-3 group-data-[collapsible=icon]:hidden" />
                </SidebarMenuButton>
            </DropdownMenuTrigger>

            <DropdownMenuContent className="w-56" align="start" side="bottom">
                {loadingEntities ? (
                    <DropdownMenuItem disabled>Loading entities...</DropdownMenuItem>
                ) : entities && entities.length > 0 ? (
                    <>
                        {entities.map((entity) => (
                            <React.Fragment key={entity.id}>
                                <DropdownMenuItem asChild>
                                    <Link href={`/brand/${entity.name.replace(" ", "-").toLocaleLowerCase()}?id=${entity.id}`} className="cursor-pointer flex items-center">
                                        {entity.images?.logo.primary ? (
                                            <Image
                                                src={entity.images?.logo.primary}
                                                alt="Primary"
                                                width={500}
                                                height={500}
                                                className='w-6 h-6 border rounded'
                                            />
                                        ) : (
                                            <Store className="mr-2 h-4 w-4" />
                                        )}
                                        {entity.name}
                                    </Link>
                                </DropdownMenuItem>
                            </React.Fragment>
                        ))}
                    </>
                ) : null}

                {canAddEntity && (
                    <DropdownMenuItem asChild>
                        <Link href="/create-entity" className="cursor-pointer">
                            <Plus className="mr-2 h-4 w-4" />
                            Create Entity
                        </Link>
                    </DropdownMenuItem>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

export default SidebarHeader
