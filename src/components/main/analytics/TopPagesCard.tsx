import type { PageAnalytics } from "@/services/google/analytics";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart3 } from "lucide-react";
import { formatDuration } from "./utils";

interface TopPagesCardProps {
    pages: PageAnalytics[];
}

export function TopPagesCard({ pages }: TopPagesCardProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Top Pages
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    {pages.length > 0 ? (
                        pages.map((page, index) => (
                            <div
                                key={page.path}
                                className="flex items-center justify-between border-b border-border pb-3 last:border-0"
                            >
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <Badge variant="outline" className="text-xs shrink-0">
                                            #{index + 1}
                                        </Badge>
                                        <span className="font-medium text-sm truncate">
                                            {page.path}
                                        </span>
                                    </div>
                                    <div className="mt-1 text-xs text-muted-foreground">
                                        {formatDuration(page.averageTimeOnPage)} avg. time •{" "}
                                        {page.bounceRate.toFixed(1)}% bounce
                                    </div>
                                </div>
                                <div className="text-right ml-4 shrink-0">
                                    <div className="font-semibold text-sm">
                                        {page.pageViews.toLocaleString()}
                                    </div>
                                    <div className="text-xs text-muted-foreground">views</div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="text-center text-sm text-muted-foreground py-8">
                            No page data available
                        </p>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
