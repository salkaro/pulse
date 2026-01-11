import type { ConversionEvent } from "@/services/google/analytics";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Target } from "lucide-react";
import { formatEventName } from "./utils";

interface ConversionEventsCardProps {
    conversions: ConversionEvent[];
}

export function ConversionEventsCard({ conversions }: ConversionEventsCardProps) {
    if (conversions.length === 0) return null;

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Conversion Events
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {conversions.slice(0, 8).map((event) => (
                        <div
                            key={event.eventName}
                            className="rounded-lg border bg-muted/50 p-4"
                        >
                            <div className="text-sm font-medium text-muted-foreground mb-2">
                                {formatEventName(event.eventName)}
                            </div>
                            <div className="text-2xl font-bold">
                                {event.eventCount.toLocaleString()}
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">
                                {event.conversionRate.toFixed(1)}% of total
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
