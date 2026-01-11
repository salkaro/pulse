"use client";

// Local Imports
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { ConnectionType, IConnection } from '@/models/connection'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import AttachEntityDialog from './AttachEntityDialog'
import { IEntity } from '@/models/entity'

// External Imports
import React, { ReactElement, useState } from 'react'
import { toast } from 'sonner'
import { Unlink } from 'lucide-react'


interface Props {
    icon: ReactElement;
    type: ConnectionType;
    name?: string;
    description?: string;
    connection?: IConnection;
    entities?: IEntity[];
    onConnectionChange?: () => void;
    handleDetach?: (connectionId: string) => void;
}

const Connection: React.FC<Props> = ({
    icon,
    type,
    name,
    description,
    connection,
    entities = [],
    onConnectionChange,
    handleDetach
}) => {
    const [isLoading, setIsLoading] = useState(false);
    const displayName = name || type.charAt(0).toUpperCase() + type.slice(1);
    const displayDescription = description || `Connect your ${displayName} account to sync data`;

    const isConnected = connection?.status === 'connected';
    const isAttached = !!connection?.entityId;

    // Find the attached entity by matching entityId
    const attachedEntity = connection?.entityId
        ? entities.find(entity => entity.id === connection.entityId)
        : undefined;

    const handleConnect = async () => {
        if (isConnected) {
            // Handle disconnect
            setIsLoading(true);
            try {
                const response = await fetch('/api/connections/disconnect', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ type }),
                });

                if (!response.ok) {
                    throw new Error('Failed to disconnect');
                }

                toast.success(`${displayName} disconnected successfully`);
                onConnectionChange?.();
            } catch (error) {
                console.error('Error disconnecting:', error);
                toast.error(`Failed to disconnect ${displayName}`);
            } finally {
                setIsLoading(false);
            }
        } else {
            // Handle connect - redirect to OAuth flow
            if (type === 'stripe') {
                window.location.href = '/api/connections/stripe/connect';
            } else if (type === 'google') {
                window.location.href = '/api/connections/google/connect';
            }
        }
    };

    // Determine status color
    const getStatusColor = () => {
        if (!isConnected) return { bg: "bg-red-500", ping: "bg-red-400" };
        if (isAttached) return { bg: "bg-green-500", ping: "bg-green-400" };
        return { bg: "bg-purple-500", ping: "bg-purple-400" };
    };

    const statusColor = getStatusColor();

    return (
        <Card>
            <CardContent className="flex items-center gap-4 py-4">
                <div className="flex items-center justify-center w-16 h-16 rounded-lg bg-muted/50">
                    {icon}
                </div>

                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-base">{displayName}</h3>
                        <div className="relative flex items-center">
                            <span
                                className={cn(
                                    "relative flex h-2.5 w-2.5 rounded-full",
                                    statusColor.bg
                                )}
                            >
                                <span
                                    className={cn(
                                        "animate-ping absolute inline-flex h-full w-full rounded-full opacity-75",
                                        statusColor.ping
                                    )}
                                />
                            </span>
                        </div>
                        {isAttached && attachedEntity && (
                            <Badge variant="secondary" className="text-xs">
                                {attachedEntity.name}
                            </Badge>
                        )}
                    </div>
                    <p className="text-sm text-muted-foreground truncate">
                        {displayDescription}
                    </p>
                </div>

                <div className="flex items-center gap-2 ml-auto">
                    {isConnected && isAttached && (
                        <Button
                            variant="ghost"
                            onClick={() => handleDetach?.(connection.id)}
                            disabled={isLoading}
                        >
                            <Unlink className="w-4 h-4 mr-2" />
                            Detach
                        </Button>
                    )}

                    {isConnected && !isAttached && connection && (
                        <AttachEntityDialog
                            connectionId={connection.id}
                            connectionType={type}
                            entities={entities}
                            onAttach={onConnectionChange}
                        />
                    )}

                    <Button
                        variant={isConnected ? "outline" : "default"}
                        onClick={handleConnect}
                        disabled={isLoading}
                    >
                        {isLoading ? "Processing..." : isConnected ? "Disconnect" : "Connect"}
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}

export default Connection
