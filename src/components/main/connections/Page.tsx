"use client"

// Local Imports
import Connection from './Connection'
import { GoogleIcon, StripeIcon } from '@/components/icons/icons'
import { Skeleton } from '@/components/ui/skeleton'
import { useOrganisation } from '@/hooks/useOrganisation'
import { useEntities } from '@/hooks/useEntities'
import { useConnections } from '@/hooks/useConnections'
import { Separator } from '@/components/ui/separator'

// External Imports
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { entityLimits } from '@/constants/limits'
import { SubscriptionType } from '@/models/organisation'
import { extractDescriptionForProvider, extractNameForProvider } from '@/utils/extract'
import NoEntityFound from '@/components/ui/no-entity-found'

const Page = () => {
    const { organisation } = useOrganisation();
    const { entities } = useEntities(organisation?.id ?? null);
    const { connections, loading: isLoading, refetch: refetchConnections } = useConnections(organisation?.id ?? null);
    const [isDetaching, setIsDetaching] = useState(false);

    useEffect(() => {
        // Check for OAuth callback messages
        const params = new URLSearchParams(window.location.search);
        const error = params.get('error');
        const success = params.get('success');

        if (error) {
            toast.error(error);
            // Clean up URL
            window.history.replaceState({}, '', window.location.pathname);
        }

        if (success) {
            toast.success(success);
            // Clean up URL and refresh connections
            window.history.replaceState({}, '', window.location.pathname);
            refetchConnections();
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleDetach = async (connectionId: string) => {
        if (!connectionId) return;

        setIsDetaching(true);
        try {
            const response = await fetch('/api/connections/detach', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ connectionId: connectionId }),
            });

            if (!response.ok) {
                throw new Error('Failed to detach connection');
            }

            toast.success('Connection detached successfully');
            await refetchConnections();
        } catch (error) {
            console.error('Error detaching connection:', error);
            toast.error('Failed to detach connection');
        } finally {
            setIsDetaching(false);
        }
    };

    const getIconForType = (type: string) => {
        switch (type) {
            case 'stripe':
                return <StripeIcon size={48}/>;
            case 'google':
                return <GoogleIcon size={48} />;
            default:
                return <div className="w-12 h-12" />;
        }
    };

    // Separate connections into attached and unused
    const attachedConnections = (connections ?? []).filter(conn =>
        conn.status === 'connected' && conn.entityId
    );
    const unusedConnections = (connections ?? []).filter(conn =>
        conn.status === 'connected' && !conn.entityId
    );

    const maxEntityConnections = entityLimits[organisation?.subscription as SubscriptionType]

    // Check which connection types have at least one connected instance
    const hasStripeConnection = (connections ?? []).some(conn => conn.type === 'stripe' && conn.status === 'connected');
    const hasGoogleConnection = (connections ?? []).some(conn => conn.type === 'google' && conn.status === 'connected');

    // Connection Counts
    const stripeConnectionCount = ((connections ?? []).filter(conn => conn.entityId !== undefined)).length;

    if (isLoading) {
        return (
            <div className='flex flex-col w-full gap-4'>
                <Skeleton className="h-32 w-full rounded-lg" />
                <Skeleton className="h-32 w-full rounded-lg" />
            </div>
        );
    }

    if (entities && entities.length === 0) {
        return (
            <NoEntityFound />
        )
    }


    return (
        <div className='flex flex-col w-full gap-6'>
            {/* Attached Connections Section */}
            {attachedConnections.length > 0 && (
                <div className='space-y-4'>
                    <div>
                        <h2 className="text-lg font-semibold">Attached</h2>
                        <p className="text-sm text-muted-foreground">Connections linked to entities</p>
                    </div>
                    <Separator />
                    <div className='flex flex-col gap-4'>
                        {attachedConnections.map((connection) => (
                            <Connection
                                key={connection.id}
                                icon={getIconForType(connection.type)}
                                type={connection.type}
                                name={extractNameForProvider(connection.type)}
                                description={extractDescriptionForProvider(connection.type)}
                                connection={connection}
                                entities={entities ?? []}
                                onConnectionChange={refetchConnections}
                                handleDetach={handleDetach}
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* Unused Connections Section */}
            {unusedConnections.length > 0 && (
                <div className='space-y-4'>
                    <div>
                        <h2 className="text-lg font-semibold">Unused</h2>
                        <p className="text-sm text-muted-foreground">Connected but not attached to any entity</p>
                    </div>
                    <Separator />
                    <div className='flex flex-col gap-4'>
                        {unusedConnections.map((connection) => (
                            <Connection
                                key={connection.id}
                                icon={getIconForType(connection.type)}
                                type={connection.type}
                                name={extractNameForProvider(connection.type)}
                                description={extractDescriptionForProvider(connection.type)}
                                connection={connection}
                                entities={entities ?? []}
                                onConnectionChange={refetchConnections}
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* Available Connections Section (Not Connected) */}
            <div className='space-y-4'>
                <div>
                    <h2 className="text-lg font-semibold">Available</h2>
                    <p className="text-sm text-muted-foreground">Connect new integrations</p>
                </div>
                <Separator />
                <div className='flex flex-col gap-4'>
                    {!hasStripeConnection && (
                        <Connection
                            key="stripe"
                            icon={<StripeIcon size={48}/>}
                            type="stripe"
                            name="Stripe"
                            description="Connect your Stripe account to monitor payments, customers, disputes and more"
                            entities={entities ?? []}
                            onConnectionChange={refetchConnections}
                        />
                    )}
                    {!hasGoogleConnection && (
                        <Connection
                            key="google"
                            icon={<GoogleIcon size={48} />}
                            type="google"
                            name="Google Analytics"
                            description="Connect your Google account for google analytics"
                            entities={entities ?? []}
                            onConnectionChange={refetchConnections}
                        />
                    )}
                    {/* Always show option to add more connections */}
                    {(hasStripeConnection && stripeConnectionCount < maxEntityConnections) && (
                        <Connection
                            key="stripe-add"
                            icon={<StripeIcon size={48}/>}
                            type="stripe"
                            name="Stripe"
                            description="Connect another Stripe account"
                            entities={entities ?? []}
                            onConnectionChange={refetchConnections}
                        />
                    )}
                    {hasGoogleConnection && (
                        <Connection
                            key="google-add"
                            icon={<GoogleIcon size={48} />}
                            type="google"
                            name="Google Analytics"
                            description="Connect another Google account"
                            entities={entities ?? []}
                            onConnectionChange={refetchConnections}
                        />
                    )}
                </div>
            </div>
        </div>
    )
}

export default Page
