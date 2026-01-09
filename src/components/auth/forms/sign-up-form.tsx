"use client"

// Local Imports
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { usersCol } from "@/constants/collections"
import PreparingForm from "./preparing-form"
import { Spinner } from "@/components/ui/spinner"
import { auth, firestore } from "@/lib/firebase/config"
import { validateEmail, validateEmailInput, validatePasswordInput } from "@/utils/input-validation"

// External Imports
import { createUserWithEmailAndPassword, sendEmailVerification } from "firebase/auth"
import { useEffect, useRef, useState } from "react"
import { IoMdEye, IoMdEyeOff } from "react-icons/io"
import { FaRegCheckCircle } from "react-icons/fa"
import { doc, updateDoc } from "firebase/firestore"
import { useRouter } from "next/navigation"
import { signIn } from "next-auth/react"

function SignUpForm({
    className,
    ...props
}: React.ComponentProps<"form">) {
    const [isClient, setIsClient] = useState(false);

    // Inputs
    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");

    // Input Validation
    const [validEmail, setValidEmail] = useState(false);
    const [hidePassword, setHidePassword] = useState(true);
    const [hasOneNumber, setHasOneNumber] = useState(false);
    const [hasOneSpecial, setHasOneSpecial] = useState(false);
    const [hasEightCharacters, setHasEightCharacters] = useState(false);

    // Page
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    // Auth
    const [emailVerifying, setEmailVerifying] = useState(false);
    const [emailVerified, setEmailVerified] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    // Refs to persist values for email verification polling
    const emailRef = useRef<string | null>(null);
    const passwordRef = useRef<string | null>(null);

    function handlePasswordInput(value: string) {
        validatePasswordInput(value, setPassword)
        // At least 8 characters
        setHasEightCharacters(value.length >= 8);

        // At least one digit
        setHasOneNumber(/\d/.test(value));

        // At least one special character (adjust the class as you like)
        setHasOneSpecial(/[!@#$%^&*()_+=]/.test(value));
    };

    function handleEmailInput(value: string) {
        if (validateEmailInput(value)) {
            setValidEmail(true);
        } else {
            setValidEmail(false);
        }
        validateEmail(value, setEmail);
    };

    async function handleSignUp() {
        try {
            setLoading(true);
            setErrorMessage("");
            const { user } = await createUserWithEmailAndPassword(auth, email, password);
            emailRef.current = email;
            passwordRef.current = password;
            await sendEmailVerification(user);
            setEmailVerifying(true);
        } catch (e: unknown) {
            console.error(e);
            setErrorMessage("Sign up failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        if (email && password) {
            handleSignUp();
        }
    };

    useEffect(() => {
        const checkVerificationInterval = setInterval(async () => {
            try {
                if (!auth.currentUser) {
                    return;
                }

                // Store the current verification status before reload
                const wasVerifiedBefore = auth.currentUser.emailVerified;

                // Reload the user properly with error handling
                try {
                    await auth.currentUser.reload();
                } catch (reloadError) {
                    console.error("Error reloading user:", reloadError);
                    return;
                }

                // Check the new verification status
                const isVerifiedNow = auth.currentUser.emailVerified;

                // Only proceed if the status changed from unverified to verified
                // This prevents the false positive issue you were experiencing
                if (!wasVerifiedBefore && isVerifiedNow) {
                    setEmailVerified(true);
                    setEmailVerifying(false);

                    try {
                        // Sign in with NextAuth credentials
                        const result = await signIn("credentials", {
                            email: emailRef.current,
                            password: passwordRef.current,
                            redirect: false,
                        });

                        if (result?.error) {
                            console.error("Error during sign-in (1):", result.error);
                            return;
                        }
                    } catch (error) {
                        console.error("Error during sign-in (2):", error)
                    }

                    try {
                        await updateDoc(
                            doc(firestore, usersCol, auth.currentUser.uid),
                            { 'authentication.onboarding': true }
                        );
                    } catch (error) {
                        console.error("Error setting onboarding: ", error)
                    }

                    clearInterval(checkVerificationInterval);
                    router.push(`/onboarding`);
                }
            } catch (error) {
                console.error("Error in verification check:", error);
            }
        }, 3000);

        return () => clearInterval(checkVerificationInterval);
    }, [router]);

    useEffect(() => {
        setIsClient(true);
    }, []);

    if (!isClient) {
        // Render a fallback placeholder during SSR
        return <PreparingForm />
    }

    return (
        <>
            {(!emailVerifying && !emailVerified) && (
                <form className={cn("flex flex-col gap-6", className)} {...props} onSubmit={(e) => handleSubmit(e)} >
                    <div className="g-recaptcha" data-sitekey="6Lc_-3krAAAAAMaYeoFalpjQ3Mk0KUNWeIqYdFHU" data-action="signup"></div>
                    <div className="flex flex-col items-center gap-2 text-center">
                        <h1 className="text-2xl font-bold">Create your account</h1>
                        <p className="text-muted-foreground text-sm text-balance">
                            Sign up to get started.
                        </p>
                    </div>
                    <div className="grid gap-6">
                        <div className="grid gap-3">
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" value={email} type="email" placeholder="m@example.com" required onChange={(e) => handleEmailInput(e.target.value)} />
                        </div>
                        <div className="grid gap-3">
                            <div className="flex items-center">
                                <Label htmlFor="password">Password</Label>
                            </div>
                            <div className="relative">
                                <Input id="password" value={password} type={hidePassword ? 'password' : 'text'} required onChange={(e) => handlePasswordInput(e.target.value)} />

                                <div className="absolute right-0 top-1/2 -translate-y-1/2 p-2 rounded hover:bg-muted/80 text-lg" onClick={() => setHidePassword(!hidePassword)}>
                                    {hidePassword ? (
                                        <IoMdEye />
                                    ) : (
                                        <IoMdEyeOff />
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="w-full px-1">
                            {/* Length Check */}
                            <div className={`flex justify-between items-center text-sm ${hasEightCharacters ? "" : "text-gray-400"}`}>
                                <span><FaRegCheckCircle /></span>
                                <span>Must contain at least 8 characters</span>
                            </div>
                            {/* Number Check */}
                            <div className={`flex justify-between items-center text-sm ${hasOneNumber ? "" : "text-gray-400"}`}>
                                <span><FaRegCheckCircle /></span>
                                <span>Must contain at least 1 number</span>
                            </div>
                            {/* Special Character Check */}
                            <div className={`flex justify-between items-center text-sm ${hasOneSpecial ? "" : "text-gray-400"}`}>
                                <span><FaRegCheckCircle /></span>
                                <span>Must contain at least 1 special character</span>
                            </div>
                        </div>

                        {errorMessage && (
                            <p className="text-red-500 text-sm mt-2">{errorMessage}</p>
                        )}
                        <Button
                            type="submit"
                            className="w-full"
                            disabled={loading || !hasEightCharacters || !hasOneNumber || !hasOneSpecial || !validEmail}
                        >
                            {loading ?
                                <div className="relative flex justify-center items-center w-full">
                                    <span>Processing...</span>
                                    <span className="absolute right-1"><Spinner /></span>
                                </div> : "Sign Up"
                            }
                        </Button>
                    </div>
                    <div className="text-center text-sm">
                        Already have an account?{" "}
                        <a href="/login" className="underline underline-offset-4">
                            Login
                        </a>
                    </div>
                </form>
            )}

            {emailVerifying && (
                <div className="flex flex-col items-center gap-2 text-center">
                    <h1 className="text-2xl font-bold">Please verify your email</h1>
                    <p className="text-muted-foreground text-sm text-balance">
                        Awaiting verification...
                    </p>
                </div>

            )}

            {emailVerified && (
                <div className="flex flex-col items-center gap-2 text-center">
                    <h1 className="text-2xl font-bold">Email Verified</h1>
                    <p className="text-muted-foreground text-sm text-balance">
                        Your email has been verified, please wait...
                    </p>
                </div>
            )}
        </>
    );
}

export default SignUpForm