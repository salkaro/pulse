"use client"

import React, { useState } from 'react'
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Card, CardContent } from "@/components/ui/card"
import { toast } from "sonner"
import { IEntity } from '@/models/entity'
import { ConnectionType } from '@/models/connection'
import { Loader2Icon, Link, Check } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Props {
    connectionId: string;
    connectionType: ConnectionType;
    entities: IEntity[];
    onAttach?: () => void;
}

const AttachEntityDialog: React.FC<Props> = ({
    connectionId,
    connectionType,
    entities,
    onAttach
}) => {
    const [open, setOpen] = useState(false);
    const [selectedEntityId, setSelectedEntityId] = useState<string>("");
    const [isLoading, setIsLoading] = useState(false);

    // Filter out entities that already have this type of connection attached
    const connectionFieldKey = `${connectionType}ConnectionId`;
    const availableEntities = entities.filter(entity => {
        return !entity.connections?.[connectionFieldKey as keyof typeof entity.connections];
    });

    const handleAttach = async () => {
        if (!selectedEntityId) {
            toast.error("Please select an entity");
            return;
        }

        setIsLoading(true);
        try {
            const response = await fetch('/api/connections/attach', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    connectionId,
                    entityId: selectedEntityId,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to attach connection to entity');
            }

            toast.success('Connection attached successfully');
            setOpen(false);
            setSelectedEntityId("");
            onAttach?.();
        } catch (error) {
            console.error('Error attaching connection:', error);
            toast.error(error instanceof Error ? error.message : 'Failed to attach connection to entity');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline">
                    <Link className="w-4 h-4 mr-2" />
                    Attach
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Attach to Entity</DialogTitle>
                    <DialogDescription>
                        Select an entity to attach this {connectionType} connection to.
                    </DialogDescription>
                </DialogHeader>

                <div className="max-h-100 overflow-y-auto pr-4">
                    <div className="space-y-3 py-4 mx-2">
                        {availableEntities.length === 0 ? (
                            <div className="p-8 text-sm text-muted-foreground text-center">
                                {entities.length === 0
                                    ? "No entities available. Create an entity first to attach connections."
                                    : `All entities already have a ${connectionType} connection attached.`
                                }
                            </div>
                        ) : (
                            availableEntities.map((entity) => (
                                <Card
                                    key={entity.id}
                                    className={cn(
                                        "cursor-pointer transition-all hover:shadow-md",
                                        selectedEntityId === entity.id
                                            ? "border-primary ring-2 ring-primary/20"
                                            : "hover:border-muted-foreground/50"
                                    )}
                                    onClick={() => !isLoading && setSelectedEntityId(entity.id)}
                                >
                                    <CardContent className="flex items-center justify-between p-4">
                                        <div className="flex-1">
                                            <h4 className="font-medium">{entity.name}</h4>
                                            <p className="text-xs text-muted-foreground mt-1">
                                                Created {new Date(entity.createdAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                        {selectedEntityId === entity.id && (
                                            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10">
                                                <Check className="w-4 h-4 text-primary" />
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            ))
                        )}
                    </div>
                </div>

                {availableEntities.length > 0 && (
                    <div className="flex justify-end gap-2 pt-4 border-t">
                        <Button
                            variant="outline"
                            onClick={() => {
                                setOpen(false);
                                setSelectedEntityId("");
                            }}
                            disabled={isLoading}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleAttach}
                            disabled={isLoading || !selectedEntityId}
                        >
                            {isLoading && <Loader2Icon className="w-4 h-4 mr-2 animate-spin" />}
                            {isLoading ? "Attaching..." : "Attach"}
                        </Button>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    )
}

export default AttachEntityDialog
