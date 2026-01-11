import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { RefreshCw } from "lucide-react";

interface Connection {
    id: string;
    googleEmail?: string;
    entityName?: string;
}

interface Property {
    propertyId: string;
    displayName: string;
}

interface AnalyticsControlsProps {
    // Connection selector
    googleConnections: Connection[];
    selectedConnectionId: string;
    onConnectionChange: (connectionId: string) => void;

    // Property selector
    properties: Property[];
    selectedPropertyId: string;
    onPropertyChange: (propertyId: string) => void;

    // Date range selector
    dateRange: string;
    onDateRangeChange: (range: string) => void;

    // Refresh
    onRefresh: () => void;
    loading: boolean;

    // Realtime users
    realtimeUsers?: number;
}

export function AnalyticsControls({
    googleConnections,
    selectedConnectionId,
    onConnectionChange,
    properties,
    selectedPropertyId,
    onPropertyChange,
    dateRange,
    onDateRangeChange,
    onRefresh,
    loading,
    realtimeUsers,
}: AnalyticsControlsProps) {
    return (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
                {/* Connection Selector */}
                <Select value={selectedConnectionId} onValueChange={onConnectionChange}>
                    <SelectTrigger className="w-full sm:w-70">
                        <SelectValue placeholder="Select connection" />
                    </SelectTrigger>
                    <SelectContent>
                        {googleConnections.map((conn) => (
                            <SelectItem key={conn.id} value={conn.id}>
                                <div className="flex items-center gap-2">
                                    <span>{conn.googleEmail || "Google Analytics"}</span>
                                    {conn.entityName && (
                                        <Badge variant="secondary" className="text-xs">
                                            {conn.entityName}
                                        </Badge>
                                    )}
                                </div>
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                {/* Property Selector */}
                {properties && properties.length > 0 && (
                    <Select value={selectedPropertyId} onValueChange={onPropertyChange}>
                        <SelectTrigger className="w-full sm:w-70">
                            <SelectValue placeholder="Select property" />
                        </SelectTrigger>
                        <SelectContent>
                            {properties.map((property) => (
                                <SelectItem key={property.propertyId} value={property.propertyId}>
                                    {property.displayName}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                )}

                {/* Date Range Selector */}
                <Select value={dateRange} onValueChange={onDateRangeChange}>
                    <SelectTrigger className="w-full sm:w-45">
                        <SelectValue placeholder="Select date range" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="7">Last 7 days</SelectItem>
                        <SelectItem value="14">Last 14 days</SelectItem>
                        <SelectItem value="30">Last 30 days</SelectItem>
                        <SelectItem value="60">Last 60 days</SelectItem>
                        <SelectItem value="90">Last 90 days</SelectItem>
                    </SelectContent>
                </Select>

                <Button
                    variant="outline"
                    size="icon"
                    className="shadow-none"
                    onClick={onRefresh}
                    disabled={loading || !selectedPropertyId}
                >
                    <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                </Button>
            </div>

            {/* Real-time indicator */}
            {realtimeUsers !== undefined && (
                <div className="flex items-center gap-2 rounded-lg bg-green-50 border border-green-200 px-4 py-2">
                    <div className="relative flex items-center">
                        <span className="relative flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500" />
                        </span>
                    </div>
                    <span className="text-sm font-medium text-green-900">
                        {realtimeUsers} active {realtimeUsers === 1 ? "user" : "users"}
                    </span>
                </div>
            )}
        </div>
    );
}
