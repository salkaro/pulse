import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { updateConnection } from '@/services/connections/update';
import { retrieveEntity } from '@/services/firebase/entities/retrieve';
import { updateEntity } from '@/services/firebase/entities/update';
import { retrieveConnection } from '@/services/connections/retrieve';
import { authOptions } from '@/lib/authOptions';

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.organisation?.id) {
            return NextResponse.json(
                { error: 'Unauthorized - No organisation found' },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { connectionId, entityId } = body;

        if (!connectionId || !entityId) {
            return NextResponse.json(
                { error: 'Missing required fields: connectionId, entityId' },
                { status: 400 }
            );
        }

        // Retrieve connection to get its type
        const connection = await retrieveConnection({
            organisationId: session.user.organisation.id,
            connectionId,
        });

        if (!connection) {
            return NextResponse.json(
                { error: 'Connection not found' },
                { status: 404 }
            );
        }

        // Retrieve entity to get its name and check if connection already attached
        const { entity, error: entityError } = await retrieveEntity({
            organisationId: session.user.organisation.id,
            entityId,
        });

        if (entityError || !entity) {
            return NextResponse.json(
                { error: entityError || 'Entity not found' },
                { status: 404 }
            );
        }

        // Check if this type of connection is already attached to this entity
        const connectionFieldKey = `${connection.type}ConnectionId` as keyof typeof entity.connections;
        if (entity.connections?.[connectionFieldKey]) {
            return NextResponse.json(
                { error: `A ${connection.type} connection is already attached to this entity` },
                { status: 400 }
            );
        }

        // Update the connection with entity information
        const { error } = await updateConnection({
            connectionId,
            organisationId: session.user.organisation.id,
            updates: {
                entityId,
            },
        });

        if (error) {
            return NextResponse.json(
                { error },
                { status: 500 }
            );
        }

        // Update the entity with the connection ID
        const { error: entityUpdateError } = await updateEntity({
            organisationId: session.user.organisation.id,
            entityId,
            connections: {
                [connectionFieldKey]: connectionId,
            },
        });

        if (entityUpdateError) {
            // Rollback connection update if entity update fails
            await updateConnection({
                connectionId,
                organisationId: session.user.organisation.id,
                updates: {
                    entityId: null,
                },
            });

            return NextResponse.json(
                { error: entityUpdateError },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            message: 'Connection attached to entity successfully'
        });
    } catch (error) {
        console.error('Error attaching connection:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
