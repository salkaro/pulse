import type { TrafficSource } from "@/services/google/analytics";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp } from "lucide-react";

interface TrafficSourcesCardProps {
    traffic: TrafficSource[];
}

export function TrafficSourcesCard({ traffic }: TrafficSourcesCardProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Traffic Sources
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    {traffic.length > 0 ? (
                        traffic.map((source, index) => (
                            <div
                                key={`${source.source}-${source.medium}`}
                                className="flex items-center justify-between border-b border-border pb-3 last:border-0"
                            >
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <Badge variant="outline" className="text-xs shrink-0">
                                            #{index + 1}
                                        </Badge>
                                        <span className="font-medium text-sm truncate">
                                            {source.source}
                                        </span>
                                    </div>
                                    <div className="mt-1 text-xs text-muted-foreground">
                                        {source.medium} • {source.conversions} conversions
                                    </div>
                                </div>
                                <div className="text-right ml-4 shrink-0">
                                    <div className="font-semibold text-sm">
                                        {source.sessions.toLocaleString()}
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                        {source.users.toLocaleString()} users
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="text-center text-sm text-muted-foreground py-8">
                            No traffic data available
                        </p>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
