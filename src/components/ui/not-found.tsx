import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FileQuestion, Home, ArrowRight } from "lucide-react";


const NotFoundInfo = () => {
    return (
        <div className="min-h-screen w-full flex flex-col items-center justify-center px-4 bg-linear-to-b from-background to-muted/20">
            <div className="max-w-2xl w-full text-center space-y-8">
                {/* Icon */}
                <div className="flex justify-center">
                    <div className="relative">
                        <div className="w-32 h-32 rounded-full bg-primary/10 flex items-center justify-center">
                            <FileQuestion className="h-16 w-16 text-primary" />
                        </div>
                        <div className="absolute -top-2 -right-2 w-20 h-20 rounded-full bg-muted/50 blur-xl"></div>
                    </div>
                </div>

                {/* Error Code */}
                <div className="space-y-4">
                    <h1 className="text-8xl md:text-9xl font-bold text-primary/20">
                        404
                    </h1>
                    <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
                        Page Not Found
                    </h2>
                    <p className="text-lg text-muted-foreground max-w-md mx-auto">
                        Sorry, we couldn&apos;t find the page you&apos;re looking for. It might have been moved or deleted.
                    </p>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                    <Button size="lg" asChild>
                        <Link href="/" className="flex items-center gap-2">
                            <Home className="h-4 w-4" />
                            Back to Home
                        </Link>
                    </Button>
                    <Button size="lg" variant="outline" asChild>
                        <Link href="/login" className="flex items-center gap-2">
                            Login
                            <ArrowRight className="h-4 w-4" />
                        </Link>
                    </Button>
                </div>

                {/* Help Text */}
                <div className="pt-8 text-sm text-muted-foreground">
                    <p>
                        If you believe this is an error, please{" "}
                        <Link href="/contact" className="text-primary hover:underline">
                            contact support
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    )
}

export default NotFoundInfo
