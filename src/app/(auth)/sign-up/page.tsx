// Local Imports
import SignUpForm from "@/components/auth/forms/sign-up-form";
import { ModeToggle } from "@/components/theme-toggle"
import { shortenedTitle, title } from "@/constants/site";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

// External Imports
import { Metadata } from "next";


export const metadata: Metadata = {
    title: "Sign Up",
    description: "Sign up page",
    robots: {
        index: false,
        follow: false,
        nocache: false,
        googleBot: {
            index: false,
            follow: false,
            noimageindex: false,
            'max-video-preview': -1,
            'max-image-preview': 'large',
            'max-snippet': -1,
        },
    },
};

export default function SignUp() {
    return (
        <div className="grid min-h-svh lg:grid-cols-2">
            <div className="flex flex-col gap-4 p-6 md:p-5">
                <div className="flex justify-between gap-2">
                    <a href="/login" className="flex items-center gap-2 font-medium">
                        <div className="text-primary-foreground flex size-6 items-center justify-center rounded-md">
                            <Avatar>
                                <AvatarImage src="/logos/icon.svg" />
                                <AvatarFallback>{shortenedTitle}</AvatarFallback>
                            </Avatar>
                        </div>
                        {title}
                    </a>
                    <ModeToggle />
                </div>
                <div className="flex flex-1 items-center justify-center">
                    <div className="w-full max-w-xs">
                        <SignUpForm />
                    </div>
                </div>
            </div>
            <div className="bg-muted relative hidden lg:flex items-center justify-center">
                <p className="font-bold text-lg">Salkaro - For a curious mind</p>
            </div>
        </div>
    );
}
