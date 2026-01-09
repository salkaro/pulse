import Link from 'next/link';
import { Lock, Sparkles, Check } from 'lucide-react';
import { Card, CardContent } from './card';
import { Button } from './button';
import { SubscriptionType } from '@/models/organisation';

interface Props {
    featureName: string;
    description?: string;
    subscriptionRequired: SubscriptionType;
    features: string[];
}

const FeatureNotIncluded: React.FC<Props> = ({
    featureName = "This feature",
    description = "Upgrade your plan to unlock this feature and many more.",
    subscriptionRequired,
    features
}) => {
    const requiredSubscription = subscriptionRequired.charAt(0).toUpperCase() + subscriptionRequired.slice(1).toLowerCase();
    return (
        <Card className="border-2 border-dashed border-primary/30 bg-linear-to-br from-primary/5 via-purple-500/5 to-pink-500/5 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-40 h-40 bg-linear-to-br from-primary/20 via-purple-500/20 to-transparent rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-0 left-0 w-40 h-40 bg-linear-to-tr from-pink-500/20 via-purple-500/20 to-transparent rounded-full blur-3xl animate-pulse [animation-delay:1s]" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl" />

            <CardContent className="relative py-8 flex flex-col items-center text-center space-y-6">
                <div className="relative">
                    <div className="w-20 h-20 rounded-full bg-linear-to-br from-primary/20 to-purple-500/20 flex items-center justify-center ring-2 ring-primary/20 ring-offset-2 ring-offset-background">
                        <Lock className="h-10 w-10 text-primary" />
                    </div>
                    <div className="absolute -top-1 -right-1 w-8 h-8 rounded-full bg-linear-to-br from-purple-500 to-pink-500 flex items-center justify-center animate-bounce [animation-delay:0.5s]">
                        <Sparkles className="h-4 w-4 text-white" />
                    </div>
                </div>

                <div className="space-y-2 max-w-md">
                    <h3 className="text-xl font-semibold tracking-tight">
                        {featureName} Not Included
                    </h3>
                    <p className="text-sm text-muted-foreground">
                        {description}
                    </p>
                </div>

                {features && features.length > 0 && (
                    <div className="w-full max-w-md">
                        <div className="bg-background/50 backdrop-blur-sm rounded-lg border border-primary/20 p-4">
                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                                Included in {featureName}:
                            </p>
                            <ul className="space-y-2">
                                {features.map((feature, index) => (
                                    <li key={index} className="flex items-start gap-2 text-sm">
                                        <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                                        <span className="text-foreground">{feature}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                )}

                <Button asChild size="lg" className="group">
                    <Link href="/settings#billing">
                        <Sparkles className="mr-2 h-4 w-4 group-hover:animate-pulse" />
                        {subscriptionRequired ? (
                            <p>Upgrade to {requiredSubscription} Plan</p>
                        ): (
                            "Upgrade Your Plan"
                        )}
                    </Link>
                </Button>
            </CardContent>
        </Card>
    )
}

export default FeatureNotIncluded
