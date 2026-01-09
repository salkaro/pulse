import Link from 'next/link'
import Image from 'next/image'
import { Store } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { IEntity } from '@/models/entity'
import { extractInitials } from '@/utils/extract'

interface BrandCardProps {
    entity: IEntity
}

const BrandCard = ({ entity }: BrandCardProps) => {
    // Count total connections for an entity
    const getConnectionCount = (entity: IEntity) => {
        let count = 0
        if (entity.connections?.stripeConnectionId) count++
        if (entity.connections?.googleConnectionId) count++
        return count
    }

    const connectionCount = getConnectionCount(entity)
    const hasConnections = connectionCount > 0

    return (
        <Link
            href={`/brand/${entity.name.replace(/\s+/g, "-").toLowerCase()}?id=${entity.id}`}
        >
            <Card className="h-full hover:border-primary hover:shadow-lg transition-all duration-200 cursor-pointer group relative overflow-hidden">
                <CardHeader className="relative">
                    <div className="flex items-start gap-4">
                        {/* Entity Image or Initials */}
                        <div className="shrink-0 relative">
                            {entity.images?.logo.primary ? (
                                <div className="relative">
                                    <Image
                                        src={entity.images.logo.primary}
                                        alt={entity.name}
                                        width={500}
                                        height={500}
                                        className="w-16 h-16 rounded-lg object-cover border-2 "
                                    />
                                    {/* Pulsing Status Dot */}
                                    {hasConnections && (
                                        <div className="absolute -top-1 -right-1">
                                            <div className="relative">
                                                <div className="w-3 h-3 rounded-full bg-green-500 border-2 border-background" />
                                                <div className="absolute inset-0 w-3 h-3 rounded-full bg-green-500 animate-ping opacity-75" />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="relative">
                                    <div className="w-16 h-16 rounded-lg border-2 border-border group-hover:border-primary transition-colors flex items-center justify-center bg-linear-to-br from-primary/10 to-primary/5">
                                        <span className="text-xl font-semibold text-primary">
                                            {extractInitials({ name: entity.name })}
                                        </span>
                                    </div>
                                    {/* Pulsing Status Dot */}
                                    {hasConnections && (
                                        <div className="absolute -top-1 -right-1">
                                            <div className="relative">
                                                <div className="w-3 h-3 rounded-full bg-green-500 border-2 border-background" />
                                                <div className="absolute inset-0 w-3 h-3 rounded-full bg-green-500 animate-ping opacity-75" />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Entity Info */}
                        <div className="flex-1 min-w-0">
                            <CardTitle className="text-lg truncate group-hover:text-primary transition-colors">
                                {entity.name}
                            </CardTitle>
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="space-y-3 relative">
                    {/* Description */}
                    {entity?.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2">
                            {entity.description}
                        </p>
                    )}

                    {/* Connection Count */}
                    <div className="flex items-center gap-2 text-sm">
                        <div className={`flex items-center gap-2 px-2 py-1 rounded-md transition-colors ${
                            hasConnections
                                ? 'bg-green-500/10 text-green-600 dark:text-green-400'
                                : 'bg-muted text-muted-foreground'
                        }`}>
                            <Store className="h-4 w-4" />
                            <span className="font-medium">
                                {connectionCount} connection{connectionCount !== 1 ? 's' : ''}
                            </span>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </Link>
    )
}

export default BrandCard
