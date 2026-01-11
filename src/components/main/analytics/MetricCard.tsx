import { Card, CardContent } from "@/components/ui/card";

interface MetricCardProps {
    icon: React.ReactNode;
    title: string;
    value: string;
    description: string;
    color: "blue" | "green" | "purple" | "orange" | "red" | "teal";
}

export function MetricCard({ icon, title, value, description, color }: MetricCardProps) {
    const colorClasses = {
        blue: "bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400",
        green: "bg-green-50 text-green-600 dark:bg-green-950 dark:text-green-400",
        purple: "bg-purple-50 text-purple-600 dark:bg-purple-950 dark:text-purple-400",
        orange: "bg-orange-50 text-orange-600 dark:bg-orange-950 dark:text-orange-400",
        red: "bg-red-50 text-red-600 dark:bg-red-950 dark:text-red-400",
        teal: "bg-teal-50 text-teal-600 dark:bg-teal-950 dark:text-teal-400",
    };

    return (
        <Card>
            <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                    <div className={`rounded-lg p-2 ${colorClasses[color]}`}>
                        {icon}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-muted-foreground">{title}</p>
                        <p className="text-2xl font-bold mt-1 truncate">{value}</p>
                        <p className="text-xs text-muted-foreground mt-1">{description}</p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
