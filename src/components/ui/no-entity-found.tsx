import Link from 'next/link';
import { SearchX, Sparkles, Plus } from 'lucide-react';
import { Card, CardContent } from './card';
import { Button } from './button';

interface Props {
    entityName?: string;
    description?: string;
    actionLabel?: string;
    onAction?: () => void;
    showCreateButton?: boolean;
    createLink?: string;
}

const NoEntityFound: React.FC<Props> = ({
    entityName = "Entities",
    description = "We couldn't find any matching results. Try adjusting your search or filters.",
    actionLabel,
    onAction,
    showCreateButton = true,
    createLink = "/create-entity"
}) => {
    return (
        <Card className="border-2 border-dashed border-blue-500/30 bg-linear-to-br from-blue-500/5 via-cyan-500/5 to-teal-500/5 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-40 h-40 bg-linear-to-br from-blue-500/20 via-cyan-500/20 to-transparent rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-0 left-0 w-40 h-40 bg-linear-to-tr from-teal-500/20 via-cyan-500/20 to-transparent rounded-full blur-3xl animate-pulse [animation-delay:1s]" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl" />

            <CardContent className="relative py-8 flex flex-col items-center text-center space-y-6">
                <div className="relative">
                    <div className="w-20 h-20 rounded-full bg-linear-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center ring-2 ring-blue-500/20 ring-offset-2 ring-offset-background">
                        <SearchX className="h-10 w-10 text-blue-500" />
                    </div>
                    <div className="absolute -top-1 -right-1 w-8 h-8 rounded-full bg-linear-to-br from-cyan-500 to-teal-500 flex items-center justify-center animate-bounce [animation-delay:0.5s]">
                        <Sparkles className="h-4 w-4 text-white" />
                    </div>
                </div>

                <div className="space-y-2 max-w-md">
                    <h3 className="text-xl font-semibold tracking-tight">
                        No {entityName} Found
                    </h3>
                    <p className="text-sm text-muted-foreground">
                        {description}
                    </p>
                </div>

                <div className="flex gap-3">
                    {actionLabel && onAction && (
                        <Button onClick={onAction} size="lg" className="group" variant="outline">
                            <Sparkles className="mr-2 h-4 w-4 group-hover:animate-pulse" />
                            {actionLabel}
                        </Button>
                    )}
                    {showCreateButton && (
                        <Button asChild size="lg" className="group">
                            <Link href={createLink}>
                                <Plus className="mr-2 h-4 w-4 group-hover:rotate-90 transition-transform" />
                                Create {entityName}
                            </Link>
                        </Button>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}

export default NoEntityFound
