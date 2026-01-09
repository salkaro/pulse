import { ShieldX } from "lucide-react";

const NoAccess = () => {
    return (
        <div className="py-20 w-full flex flex-col items-center justify-center px-4 to-muted/20">
            <div className="max-w-2xl w-full text-center space-y-8">
                {/* Icon */}
                <div className="flex justify-center">
                    <div className="relative">
                        <div className="w-32 h-32 rounded-full bg-destructive/10 flex items-center justify-center">
                            <ShieldX className="h-16 w-16 text-destructive" />
                        </div>
                        <div className="absolute -top-2 -right-2 w-20 h-20 rounded-full bg-muted/50 blur-xl"></div>
                    </div>
                </div>

                {/* Error Code */}
                <div className="space-y-4">
                    <h1 className="text-8xl md:text-9xl font-bold text-destructive/20">
                        403
                    </h1>
                    <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
                        Access Denied
                    </h2>
                    <p className="text-lg text-muted-foreground max-w-md mx-auto">
                        You don&apos;t have permission to view this page. Please contact your administrator if you believe this is an error.
                    </p>
                </div>
            </div>
        </div>
    )
}

export default NoAccess
