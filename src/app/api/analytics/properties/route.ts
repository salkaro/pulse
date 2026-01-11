import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { listAnalyticsProperties } from '@/services/google/analytics';

export const dynamic = 'force-dynamic';

/**
 * GET /api/analytics/properties
 * List all Google Analytics properties accessible with the connected account
 *
 * Query params:
 * - connectionId: Connection ID (required)
 */
export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.organisation?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const searchParams = request.nextUrl.searchParams;
        const connectionId = searchParams.get('connectionId');

        if (!connectionId) {
            return NextResponse.json(
                { error: 'Connection ID is required' },
                { status: 400 }
            );
        }

        const properties = await listAnalyticsProperties(
            session.user.organisation.id,
            connectionId
        );

        return NextResponse.json({
            success: true,
            data: properties,
        });
    } catch (error) {
        console.error('Error listing Analytics properties:', error);
        return NextResponse.json(
            {
                success: false,
                error:
                    error instanceof Error
                        ? error.message
                        : 'Failed to list Analytics properties',
            },
            { status: 500 }
        );
    }
}
