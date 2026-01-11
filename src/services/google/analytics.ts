import { BetaAnalyticsDataClient } from '@google-analytics/data';
import { google } from 'googleapis';
import { retrieveConnection } from '@/services/connections/retrieve';

/**
 * Get Analytics Data API client with OAuth access token
 */
async function getAnalyticsClient(
    organisationId: string,
    connectionId: string
): Promise<BetaAnalyticsDataClient> {
    const connection = await retrieveConnection({
        organisationId,
        connectionId,
    });

    if (!connection || connection.status !== 'connected') {
        throw new Error('Google Analytics connection not found or not connected');
    }

    if (!connection.accessToken) {
        throw new Error('Google Analytics access token not found');
    }

    if (!connection.refreshToken) {
        throw new Error('Google Analytics refresh token not found');
    }

    // Create BetaAnalyticsDataClient with user OAuth2 credentials
    // Using the credentials object approach with authorized_user type
    const client = new BetaAnalyticsDataClient({
        credentials: {
            type: 'authorized_user',
            client_id: process.env.GOOGLE_CLIENT_ID,
            client_secret: process.env.GOOGLE_CLIENT_SECRET,
            refresh_token: connection.refreshToken,
        },
    });

    return client;
}

/**
 * Interface for analytics metrics response
 */
export interface AnalyticsMetrics {
    activeUsers: number;
    sessions: number;
    pageViews: number;
    averageSessionDuration: number;
    bounceRate: number;
    conversions: number;
}

/**
 * Interface for page analytics
 */
export interface PageAnalytics {
    path: string;
    pageViews: number;
    uniquePageViews: number;
    averageTimeOnPage: number;
    bounceRate: number;
}

/**
 * Interface for traffic source
 */
export interface TrafficSource {
    source: string;
    medium: string;
    users: number;
    sessions: number;
    conversions: number;
}

/**
 * Interface for conversion event
 */
export interface ConversionEvent {
    eventName: string;
    eventCount: number;
    conversionRate: number;
}

/**
 * Interface for date range
 */
export interface DateRange {
    startDate: string; // Format: YYYY-MM-DD or NdaysAgo
    endDate: string; // Format: YYYY-MM-DD or today
}

/**
 * Fetch overall analytics metrics for a date range
 */
export async function getAnalyticsMetrics(
    organisationId: string,
    connectionId: string,
    propertyId: string,
    dateRange: DateRange = {
        startDate: '30daysAgo',
        endDate: 'today',
    }
): Promise<AnalyticsMetrics> {
    try {
        const client = await getAnalyticsClient(organisationId, connectionId);

        const [response] = await client.runReport({
            property: `properties/${propertyId}`,
            dateRanges: [dateRange],
            metrics: [
                { name: 'activeUsers' },
                { name: 'sessions' },
                { name: 'screenPageViews' },
                { name: 'averageSessionDuration' },
                { name: 'bounceRate' },
                { name: 'conversions' },
            ],
        });

        const row = response.rows?.[0];
        if (!row?.metricValues) {
            return {
                activeUsers: 0,
                sessions: 0,
                pageViews: 0,
                averageSessionDuration: 0,
                bounceRate: 0,
                conversions: 0,
            };
        }

        return {
            activeUsers: parseInt(row.metricValues[0]?.value || '0'),
            sessions: parseInt(row.metricValues[1]?.value || '0'),
            pageViews: parseInt(row.metricValues[2]?.value || '0'),
            averageSessionDuration: parseFloat(row.metricValues[3]?.value || '0'),
            bounceRate: parseFloat(row.metricValues[4]?.value || '0'),
            conversions: parseInt(row.metricValues[5]?.value || '0'),
        };
    } catch (error) {
        console.error("getAnalytics [ERROR]", error);
        return {
            activeUsers: 0,
            sessions: 0,
            pageViews: 0,
            averageSessionDuration: 0,
            bounceRate: 0,
            conversions: 0,
        };
    }
}

/**
 * Fetch page-level analytics
 */
export async function getPageAnalytics(
    organisationId: string,
    connectionId: string,
    propertyId: string,
    dateRange: DateRange = {
        startDate: '30daysAgo',
        endDate: 'today',
    },
    limit: number = 10
): Promise<PageAnalytics[]> {
    const client = await getAnalyticsClient(organisationId, connectionId);

    const [response] = await client.runReport({
        property: `properties/${propertyId}`,
        dateRanges: [dateRange],
        dimensions: [{ name: 'pagePath' }],
        metrics: [
            { name: 'screenPageViews' },
            { name: 'sessions' },
            { name: 'averageSessionDuration' },
            { name: 'bounceRate' },
        ],
        orderBys: [
            {
                metric: { metricName: 'screenPageViews' },
                desc: true,
            },
        ],
        limit,
    });

    if (!response.rows) {
        return [];
    }

    return response.rows.map((row) => ({
        path: row.dimensionValues?.[0]?.value || '',
        pageViews: parseInt(row.metricValues?.[0]?.value || '0'),
        uniquePageViews: parseInt(row.metricValues?.[1]?.value || '0'),
        averageTimeOnPage: parseFloat(row.metricValues?.[2]?.value || '0'),
        bounceRate: parseFloat(row.metricValues?.[3]?.value || '0'),
    }));
}

/**
 * Fetch traffic sources
 */
export async function getTrafficSources(
    organisationId: string,
    connectionId: string,
    propertyId: string,
    dateRange: DateRange = {
        startDate: '30daysAgo',
        endDate: 'today',
    },
    limit: number = 10
): Promise<TrafficSource[]> {
    const client = await getAnalyticsClient(organisationId, connectionId);

    const [response] = await client.runReport({
        property: `properties/${propertyId}`,
        dateRanges: [dateRange],
        dimensions: [{ name: 'sessionSource' }, { name: 'sessionMedium' }],
        metrics: [
            { name: 'activeUsers' },
            { name: 'sessions' },
            { name: 'conversions' },
        ],
        orderBys: [
            {
                metric: { metricName: 'sessions' },
                desc: true,
            },
        ],
        limit,
    });

    if (!response.rows) {
        return [];
    }

    return response.rows.map((row) => ({
        source: row.dimensionValues?.[0]?.value || '',
        medium: row.dimensionValues?.[1]?.value || '',
        users: parseInt(row.metricValues?.[0]?.value || '0'),
        sessions: parseInt(row.metricValues?.[1]?.value || '0'),
        conversions: parseInt(row.metricValues?.[2]?.value || '0'),
    }));
}

/**
 * Fetch conversion events
 */
export async function getConversionEvents(
    organisationId: string,
    connectionId: string,
    propertyId: string,
    dateRange: DateRange = {
        startDate: '30daysAgo',
        endDate: 'today',
    }
): Promise<ConversionEvent[]> {
    const client = await getAnalyticsClient(organisationId, connectionId);

    const [response] = await client.runReport({
        property: `properties/${propertyId}`,
        dateRanges: [dateRange],
        dimensions: [{ name: 'eventName' }],
        metrics: [{ name: 'eventCount' }, { name: 'conversions' }],
        orderBys: [
            {
                metric: { metricName: 'eventCount' },
                desc: true,
            },
        ],
        limit: 20,
    });

    if (!response.rows) {
        return [];
    }

    const totalEvents = response.rows.reduce(
        (sum, row) => sum + parseInt(row.metricValues?.[0]?.value || '0'),
        0
    );

    return response.rows.map((row) => {
        const eventCount = parseInt(row.metricValues?.[0]?.value || '0');
        return {
            eventName: row.dimensionValues?.[0]?.value || '',
            eventCount,
            conversionRate: totalEvents > 0 ? (eventCount / totalEvents) * 100 : 0,
        };
    });
}

/**
 * Fetch real-time active users
 */
export async function getRealtimeUsers(
    organisationId: string,
    connectionId: string,
    propertyId: string
): Promise<number> {
    const client = await getAnalyticsClient(organisationId, connectionId);

    const [response] = await client.runRealtimeReport({
        property: `properties/${propertyId}`,
        metrics: [{ name: 'activeUsers' }],
    });

    const activeUsers = response.rows?.[0]?.metricValues?.[0]?.value || '0';
    return parseInt(activeUsers);
}

/**
 * List all Google Analytics properties accessible with the connected account
 */
export async function listAnalyticsProperties(
    organisationId: string,
    connectionId: string
): Promise<
    Array<{
        name: string;
        propertyId: string;
        displayName: string;
        websiteUrl?: string;
    }>
> {
    const connection = await retrieveConnection({
        organisationId,
        connectionId,
    });

    if (!connection || connection.status !== 'connected') {
        throw new Error('Google Analytics connection not found or not connected');
    }

    if (!connection.accessToken) {
        throw new Error('Google Analytics access token not found');
    }

    const accessToken = connection.accessToken;

    const oauth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        process.env.GOOGLE_OAUTH_REDIRECT_URI
    );

    oauth2Client.setCredentials({
        access_token: accessToken,
        refresh_token: connection.refreshToken || undefined,
    });

    const analyticsadmin = google.analyticsadmin({
        version: 'v1beta',
        auth: oauth2Client,
    });

    try {
        // First, list all accounts the user has access to
        const accountsResponse = await analyticsadmin.accounts.list();
        const accounts = accountsResponse.data.accounts || [];

        if (accounts.length === 0) {
            console.log('No Analytics accounts found');
            return [];
        }

        // Get properties from all accounts
        const allProperties: Array<{
            name: string;
            propertyId: string;
            displayName: string;
            websiteUrl?: string;
        }> = [];

        for (const account of accounts) {
            try {
                const propertiesResponse = await analyticsadmin.properties.list({
                    filter: `parent:${account.name}`,
                });
                const properties = propertiesResponse.data.properties || [];

                properties.forEach((property) => {
                    allProperties.push({
                        name: property.name || '',
                        propertyId: property.name?.split('/').pop() || '',
                        displayName: property.displayName || '',
                        websiteUrl: property.industryCategory || undefined,
                    });
                });
            } catch (propertyError) {
                console.error(`Error listing properties for account ${account.name}:`, propertyError);
                // Continue with other accounts even if one fails
            }
        }

        return allProperties;
    } catch (error) {
        console.error('Error listing Analytics properties:', error);
        return [];
    }
}

/**
 * Get custom date range helper
 */
export function getDateRange(days: number): DateRange {
    const today = new Date();
    const startDate = new Date(today);
    startDate.setDate(startDate.getDate() - days);

    return {
        startDate: startDate.toISOString().split('T')[0],
        endDate: today.toISOString().split('T')[0],
    };
}
