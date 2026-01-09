import Link from 'next/link';
import { Unplug, Sparkles, Plus } from 'lucide-react';
import { Card, CardContent } from './card';
import { Button } from './button';

interface Props {
    title?: string;
    description?: string;
    showConnectButton?: boolean;
}

const NoConnectionAttached: React.FC<Props> = ({
    title = "No Connection Attached",
    description = "Connect your account to start syncing data and unlock powerful features.",
    showConnectButton = true
}) => {
    return (
        <Card className="border-2 border-dashed border-orange-500/30 bg-linear-to-br from-orange-500/5 via-amber-500/5 to-yellow-500/5 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-40 h-40 bg-linear-to-br from-orange-500/20 via-amber-500/20 to-transparent rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-0 left-0 w-40 h-40 bg-linear-to-tr from-yellow-500/20 via-amber-500/20 to-transparent rounded-full blur-3xl animate-pulse [animation-delay:1s]" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl" />

            <CardContent className="relative py-8 flex flex-col items-center text-center space-y-6">
                <div className="relative">
                    <div className="w-20 h-20 rounded-full bg-linear-to-br from-orange-500/20 to-amber-500/20 flex items-center justify-center ring-2 ring-orange-500/20 ring-offset-2 ring-offset-background">
                        <Unplug className="h-10 w-10 text-orange-500" />
                    </div>
                    <div className="absolute -top-1 -right-1 w-8 h-8 rounded-full bg-linear-to-br from-amber-500 to-yellow-500 flex items-center justify-center animate-bounce [animation-delay:0.5s]">
                        <Sparkles className="h-4 w-4 text-white" />
                    </div>
                </div>

                <div className="space-y-2 max-w-md">
                    <h3 className="text-xl font-semibold tracking-tight">
                        {title}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                        {description}
                    </p>
                </div>

                {showConnectButton && (
                    <Button asChild size="lg" className="group">
                        <Link href="/connections">
                            <Plus className="mr-2 h-4 w-4 group-hover:rotate-90 transition-transform" />
                            Connect Account
                        </Link>
                    </Button>
                )}
            </CardContent>
        </Card>
    )
}

export default NoConnectionAttached
