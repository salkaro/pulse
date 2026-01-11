"use client";

import { useState, useEffect, useMemo } from "react";
import { Calendar, TrendingUp, Users, Eye, Clock, Target, BarChart3, Activity } from "lucide-react";

import { useOrganisation } from "@/hooks/useOrganisation";
import { useEntities } from "@/hooks/useEntities";
import { useConnections } from "@/hooks/useConnections";
import { useAnalytics } from "@/hooks/useAnalytics";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import NoEntityFound from "@/components/ui/no-entity-found";
import NoConnectionAttached from "@/components/ui/no-connection-attached";
import { Colors } from "@/constants/colors";
import { MetricCard } from "./MetricCard";
import { TopPagesCard } from "./TopPagesCard";
import { TrafficSourcesCard } from "./TrafficSourcesCard";
import { ConversionEventsCard } from "./ConversionEventsCard";
import { AnalyticsControls } from "./AnalyticsControls";
import { formatDuration } from "./utils";

const Page = () => {
    const { organisation, loading: loadingOrganisation } = useOrganisation();
    const { entities } = useEntities(organisation?.id ?? null);
    const { connections, loading: loadingConnections } = useConnections(organisation?.id ?? null);

    // Find Google Analytics connections
    const googleConnections = useMemo(
        () =>
            (connections ?? []).filter(
                (conn) => conn.type === "google" && conn.status === "connected"
            ),
        [connections]
    );

    // State
    const [selectedConnectionId, setSelectedConnectionId] = useState<string>("");
    const [selectedPropertyId, setSelectedPropertyId] = useState<string>("");
    const [dateRange, setDateRange] = useState<string>("30");

    // Get the selected connection and entity
    const selectedConnection = useMemo(
        () => googleConnections.find((conn) => conn.id === selectedConnectionId),
        [googleConnections, selectedConnectionId]
    );

    const selectedEntity = useMemo(
        () => entities?.find((entity) => entity.id === selectedConnection?.entityId),
        [entities, selectedConnection]
    );

    // Analytics hook
    const {
        data,
        loading: loadingAnalytics,
        error,
        refetch,
        fetchRealtime,
    } = useAnalytics(organisation?.id ?? null, {
        propertyId: selectedPropertyId,
        connectionId: selectedConnectionId,
        startDate: `${dateRange}daysAgo`,
        endDate: "today",
        enabled: !!selectedConnectionId, // Enable when connection is selected, not just propertyId
    });
    
    // Auto-select first connection
    useEffect(() => {
        if (!selectedConnectionId && googleConnections.length > 0) {
            // Use setTimeout to avoid setting state during render
            const timer = setTimeout(() => {
                setSelectedConnectionId(googleConnections[0].id);
            }, 0);
            return () => clearTimeout(timer);
        }
    }, [googleConnections, selectedConnectionId]);

    // Auto-select first property
    useEffect(() => {
        if (!selectedPropertyId && data?.properties && data.properties.length > 0) {
            // Use setTimeout to avoid setting state during render
            const timer = setTimeout(() => {
                setSelectedPropertyId(data.properties[0].propertyId);
            }, 0);
            return () => clearTimeout(timer);
        }
    }, [data?.properties, selectedPropertyId]);

    // Auto-refresh realtime data every 30 seconds
    useEffect(() => {
        if (selectedPropertyId) {
            const interval = setInterval(fetchRealtime, 30000);
            return () => clearInterval(interval);
        }
    }, [selectedPropertyId, fetchRealtime]);

    // Loading initial data
    if (loadingOrganisation || loadingConnections) {
        return (
            <div className="flex flex-col w-full gap-6">
                <div className="space-y-4">
                    <Skeleton className="h-10 w-64" />
                    <Skeleton className="h-4 w-96" />
                    <Separator />
                    <div className="flex gap-3">
                        <Skeleton className="h-10 w-70" />
                        <Skeleton className="h-10 w-70" />
                        <Skeleton className="h-10 w-45" />
                        <Skeleton className="h-10 w-24" />
                    </div>
                </div>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {[...Array(6)].map((_, i) => (
                        <Skeleton key={i} className="h-32 w-full rounded-lg" />
                    ))}
                </div>
                <div className="grid gap-6 lg:grid-cols-2">
                    <Skeleton className="h-96 w-full rounded-lg" />
                    <Skeleton className="h-96 w-full rounded-lg" />
                </div>
            </div>
        );
    }

    // No entities
    if (entities && entities.length === 0) {
        return <NoEntityFound />;
    }

    // No Google connections
    if (!googleConnections || googleConnections.length === 0) {
        return (
            <NoConnectionAttached title="No Google Connection Attached" />
        );
    }

    return (
        <div className="flex flex-col w-full gap-6 mt-8">
            {/* Header & Controls */}
            <div className="space-y-4">
                <AnalyticsControls
                    googleConnections={googleConnections}
                    selectedConnectionId={selectedConnectionId}
                    onConnectionChange={setSelectedConnectionId}
                    properties={data?.properties || []}
                    selectedPropertyId={selectedPropertyId}
                    onPropertyChange={setSelectedPropertyId}
                    dateRange={dateRange}
                    onDateRangeChange={setDateRange}
                    onRefresh={refetch}
                    loading={loadingAnalytics}
                    realtimeUsers={data?.metrics?.activeUsers}
                />

                <Separator />
            </div>

            {/* Loading State */}
            {loadingAnalytics && !data && (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {[...Array(6)].map((_, i) => (
                        <Skeleton key={i} className="h-32 w-full rounded-lg" />
                    ))}
                </div>
            )}

            {/* Error State */}
            {error && (
                <Card className="border-red-200 bg-red-50">
                    <CardContent className="pt-6">
                        <div className="flex items-start gap-3">
                            <div className="rounded-full bg-red-100 p-2">
                                <TrendingUp className="h-5 w-5 text-red-600" />
                            </div>
                            <div className="flex-1">
                                <h3 className="font-semibold text-red-900">Error loading analytics</h3>
                                <p className="text-sm text-red-700 mt-1">{error}</p>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={refetch}
                                    className="mt-3 border-red-300 text-red-900 hover:bg-red-100"
                                >
                                    Try Again
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Analytics Data */}
            {!loadingAnalytics && data && selectedPropertyId && (
                <>
                    {/* Key Metrics */}
                    {data.metrics && (
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            <MetricCard
                                icon={<Users className="h-5 w-5" />}
                                title="Active Users"
                                value={data.metrics.activeUsers.toLocaleString()}
                                description="Unique visitors in selected period"
                                color="blue"
                            />
                            <MetricCard
                                icon={<Activity className="h-5 w-5" />}
                                title="Sessions"
                                value={data.metrics.sessions.toLocaleString()}
                                description="Total sessions recorded"
                                color="green"
                            />
                            <MetricCard
                                icon={<Eye className="h-5 w-5" />}
                                title="Page Views"
                                value={data.metrics.pageViews.toLocaleString()}
                                description="Total pages viewed"
                                color="purple"
                            />
                            <MetricCard
                                icon={<Clock className="h-5 w-5" />}
                                title="Avg. Session Duration"
                                value={formatDuration(data.metrics.averageSessionDuration)}
                                description="Average time per session"
                                color="orange"
                            />
                            <MetricCard
                                icon={<TrendingUp className="h-5 w-5" />}
                                title="Bounce Rate"
                                value={`${data.metrics.bounceRate.toFixed(1)}%`}
                                description="Single-page sessions"
                                color="red"
                            />
                            <MetricCard
                                icon={<Target className="h-5 w-5" />}
                                title="Conversions"
                                value={data.metrics.conversions.toLocaleString()}
                                description="Goal completions"
                                color="teal"
                            />
                        </div>
                    )}

                    {/* Two Column Layout */}
                    <div className="grid gap-6 lg:grid-cols-2">
                        <TopPagesCard pages={data.pages} />
                        <TrafficSourcesCard traffic={data.traffic} />
                    </div>

                    {/* Conversion Events */}
                    <ConversionEventsCard conversions={data.conversions} />

                    {/* Entity Info */}
                    {selectedEntity && (
                        <Card className="bg-muted/30">
                            <CardContent className="pt-6">
                                <div className="flex items-center gap-3">
                                    <Calendar className="h-5 w-5 text-muted-foreground" />
                                    <div>
                                        <p className="text-sm font-medium">
                                            Showing analytics for: <span className="font-bold">{selectedEntity.name}</span>
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            Data from the last {dateRange} days
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </>
            )}

            {/* No Property Selected */}
            {!selectedPropertyId && !loadingAnalytics && googleConnections.length > 0 && (
                <div className="flex flex-col items-center justify-center py-12">
                    <div className="rounded-full bg-muted p-6 mb-4">
                        <BarChart3 className="h-12 w-12" style={{ color: Colors.google }} />
                    </div>
                    <h2 className="text-xl font-semibold mb-2">Select a Property</h2>
                    <p className="text-muted-foreground text-center max-w-md">
                        Choose a Google Analytics property from the dropdown above to view analytics data.
                    </p>
                </div>
            )}
        </div>
    );
};

export default Page;
