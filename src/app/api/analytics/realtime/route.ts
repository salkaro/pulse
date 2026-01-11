import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { getRealtimeUsers } from '@/services/google/analytics';

export const dynamic = 'force-dynamic';

/**
 * GET /api/analytics/realtime
 * Fetch real-time active users
 *
 * Query params:
 * - propertyId: Google Analytics property ID (required)
 * - connectionId: Connection ID (required)
 */
export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.organisation?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const searchParams = request.nextUrl.searchParams;
        const propertyId = searchParams.get('propertyId');
        const connectionId = searchParams.get('connectionId');

        if (!propertyId || !connectionId) {
            return NextResponse.json(
                { error: 'Property ID and Connection ID are required' },
                { status: 400 }
            );
        }

        const activeUsers = await getRealtimeUsers(
            session.user.organisation.id,
            connectionId,
            propertyId
        );

        return NextResponse.json({
            success: true,
            data: {
                activeUsers,
                timestamp: new Date().toISOString(),
            },
        });
    } catch (error) {
        console.error('Error fetching real-time users:', error);
        return NextResponse.json(
            {
                success: false,
                error:
                    error instanceof Error
                        ? error.message
                        : 'Failed to fetch real-time users',
            },
            { status: 500 }
        );
    }
}
