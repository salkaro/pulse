"use client"

// Local Imports
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import PreparingForm from "./preparing-form"
import { resetPassword } from "@/services/firebase/admin-reset"
import { validateEmail, validateEmailInput } from "@/utils/input-validation"

// External Imports
import { useEffect, useState } from "react"
import { toast } from "sonner"

function ResetForm({
    className,
    ...props
}: React.ComponentProps<"form">) {
    const [isClient, setIsClient] = useState(false);

    // Inputs
    const [email, setEmail] = useState<string>("");

    // Input Validation
    const [validEmail, setValidEmail] = useState(false);

    // Page
    const [loading, setLoading] = useState(false);


    function handleEmailInput(value: string) {
        if (validateEmailInput(value)) {
            setValidEmail(true);
        } else {
            setValidEmail(false);
        }
        validateEmail(value, setEmail);
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);

        try {
            const { success, message } = await resetPassword(email);

            if (success) {
                toast(message, { description: "Be sure to check your spam" });
            } else {
                toast(message || 'Something went wrong', { description: "Please try again" });
            }
        } catch {

        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        setIsClient(true);
    }, []);

    if (!isClient) {
        // Render a fallback placeholder during SSR
        return <PreparingForm />
    }


    return (
        <form className={cn("flex flex-col gap-6", className)} {...props} onSubmit={handleSubmit}>
            <div className="g-recaptcha" data-sitekey="6Lc_-3krAAAAAMaYeoFalpjQ3Mk0KUNWeIqYdFHU" data-action="password_reset"></div>
            <div className="flex flex-col items-center gap-2 text-center">
                <h1 className="text-2xl font-bold">Reset password</h1>
                <p className="text-muted-foreground text-sm text-balance">
                    Enter your email below to reset password
                </p>
            </div>
            <div className="grid gap-6">
                <div className="grid gap-3">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" value={email} type="email" placeholder="m@example.com" required onChange={(e) => handleEmailInput(e.target.value)} />
                </div>
                <Button
                    type="submit"
                    className="w-full"
                    disabled={loading || !validEmail}
                >
                    Send Reset Link
                </Button>
            </div>
            <div className="text-center text-sm">
                Know your password?{" "}
                <a href="/sign-up" className="underline underline-offset-4">
                    Login
                </a>
            </div>
        </form>
    )
}

export default ResetForm