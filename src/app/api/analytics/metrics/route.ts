import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { getAnalyticsMetrics } from '@/services/google/analytics';

export const dynamic = 'force-dynamic';

/**
 * GET /api/analytics/metrics
 * Fetch overall analytics metrics
 *
 * Query params:
 * - connectionId: Connection ID (required)
 * - propertyId: Google Analytics property ID (required)
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
        const connectionId = searchParams.get('connectionId');
        const propertyId = searchParams.get('propertyId');
        const startDate = searchParams.get('startDate') || '30daysAgo';
        const endDate = searchParams.get('endDate') || 'today';

        if (!connectionId) {
            return NextResponse.json(
                { error: 'Connection ID is required' },
                { status: 400 }
            );
        }

        if (!propertyId) {
            return NextResponse.json(
                { error: 'Property ID is required' },
                { status: 400 }
            );
        }

        const metrics = await getAnalyticsMetrics(
            session.user.organisation.id,
            connectionId,
            propertyId,
            { startDate, endDate }
        );

        return NextResponse.json({
            success: true,
            data: metrics,
            dateRange: { startDate, endDate },
        });
    } catch (error) {
        console.error('Error fetching analytics metrics:', error);
        return NextResponse.json(
            {
                success: false,
                error:
                    error instanceof Error
                        ? error.message
                        : 'Failed to fetch analytics metrics',
            },
            { status: 500 }
        );
    }
}
