import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { updateConnection } from '@/services/connections/update';
import { retrieveConnection } from '@/services/connections/retrieve';
import { updateEntity } from '@/services/firebase/entities/update';
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
        const { connectionId } = body;

        if (!connectionId) {
            return NextResponse.json(
                { error: 'Missing required field: connectionId' },
                { status: 400 }
            );
        }

        // Retrieve connection to get entity ID and type
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

        const entityId = connection.entityId;

        // Remove entity information from the connection
        const { error } = await updateConnection({
            connectionId,
            organisationId: session.user.organisation.id,
            updates: {
                entityId: null,
                entityName: null,
            },
        });

        if (error) {
            return NextResponse.json(
                { error },
                { status: 500 }
            );
        }

        // Remove connection ID from entity if entity was attached
        if (entityId) {
            const connectionFieldKey = `${connection.type}ConnectionId`;
            await updateEntity({
                organisationId: session.user.organisation.id,
                entityId,
                connections: {
                    [connectionFieldKey]: null,
                },
            });
        }

        return NextResponse.json({
            success: true,
            message: 'Connection detached from entity successfully'
        });
    } catch (error) {
        console.error('Error detaching connection:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
