import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { getConversionEvents } from '@/services/google/analytics';

export const dynamic = 'force-dynamic';

/**
 * GET /api/analytics/conversions
 * Fetch conversion event analytics
 *
 * Query params:
 * - propertyId: Google Analytics property ID (required)
 * - connectionId: Connection ID (required)
 * - startDate: Start date (default: 30daysAgo)
 * - endDate: End date (default: today)
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
        const startDate = searchParams.get('startDate') || '30daysAgo';
        const endDate = searchParams.get('endDate') || 'today';

        if (!propertyId || !connectionId) {
            return NextResponse.json(
                { error: 'Property ID and Connection ID are required' },
                { status: 400 }
            );
        }

        const conversions = await getConversionEvents(
            session.user.organisation.id,
            connectionId,
            propertyId,
            { startDate, endDate }
        );

        return NextResponse.json({
            success: true,
            data: conversions,
            dateRange: { startDate, endDate },
        });
    } catch (error) {
        console.error('Error fetching conversion events:', error);
        return NextResponse.json(
            {
                success: false,
                error:
                    error instanceof Error
                        ? error.message
                        : 'Failed to fetch conversion events',
            },
            { status: 500 }
        );
    }
}
