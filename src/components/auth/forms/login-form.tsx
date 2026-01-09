"use client"

// External Imports
import { toast } from "sonner"
import { signIn } from "next-auth/react"
import { Loader2Icon } from "lucide-react"
import { doc, getDoc } from "firebase/firestore"
import { useEffect, useState } from "react"
import { IoMdEye, IoMdEyeOff } from "react-icons/io"
import { useRouter, useSearchParams } from "next/navigation"
import { signInWithEmailAndPassword as firebaseSignIn } from "firebase/auth";

// Local Imports
import { validateEmail, validateEmailInput, validatePasswordInput } from "@/utils/input-validation"
import { auth, firestore } from "@/lib/firebase/config"
import PreparingForm from "./preparing-form"
import { usersCol } from "@/constants/collections"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { IUser } from "@/models/user"
import { cn } from "@/lib/utils"



function LoginForm({
    className,
    ...props
}: React.ComponentProps<"form">) {
    const searchParams = useSearchParams();

    const [isClient, setIsClient] = useState(false);
    const router = useRouter();

    // Inputs
    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");

    // Input Validation
    const [hidePassword, setHidePassword] = useState(true);
    const [validEmail, setValidEmail] = useState(false);

    // Page
    const [errorMessage, setErrorMessage] = useState("");
    const [loading, setLoading] = useState(false);

    function handlePasswordInput(value: string) {
        validatePasswordInput(value, setPassword)
    }


    function handleEmailInput(value: string) {
        if (validateEmailInput(value)) {
            setValidEmail(true);
        } else {
            setValidEmail(false);
        }
        validateEmail(value, setEmail);
    }


    function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setErrorMessage("")
        if (email && password) {
            handleLogin();
        }
    }

    async function handleLogin() {
        setLoading(true);

        try {
            const result = await signIn("credentials", {
                email,
                password,
                redirect: false,
            });
            if (result?.error) {
                setErrorMessage("Invalid email or password");
            } else {
                await firebaseSignIn(auth, email, password);
                const userRef = doc(firestore, usersCol, auth.currentUser?.uid ?? "");
                const userDoc = await getDoc(userRef);
                const userData = userDoc.data() as IUser;
                if (userData.authentication?.onboarding) {
                    router.push("/onboarding")
                } else {
                    router.push(`/preparing`);
                }
            }
        } catch (e) {
            console.error("Login error:", e);
            setErrorMessage("Login failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        setIsClient(true);
    }, []);

    useEffect(() => {
        const accountCreated = searchParams.get("account-created");

        if (accountCreated === "true") {
            toast.success("Account created successfully. Please log in.");
        }
    }, [searchParams]);

    if (!isClient) {
        // Render a fallback placeholder during SSR
        return <PreparingForm />
    }

    return (
        <form className={cn("flex flex-col gap-6", className)} {...props} onSubmit={handleSubmit}>
            <div className="g-recaptcha" data-sitekey="6Lc_-3krAAAAAMaYeoFalpjQ3Mk0KUNWeIqYdFHU" data-action="login"></div>
            <div className="flex flex-col items-center gap-2 text-center">
                <h1 className="text-2xl font-bold">Login to your account</h1>
                <p className="text-muted-foreground text-sm text-balance">
                    Enter your email below to login to your account
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
                        <a
                            href="/reset"
                            className="ml-auto text-sm underline-offset-4 hover:underline"
                        >
                            Forgot your password?
                        </a>
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
                    {errorMessage && (
                        <p className="text-red-500 text-sm mt-2">{errorMessage}</p>
                    )}
                </div>
                <Button
                    type="submit"
                    className="w-full"
                    disabled={loading || !validEmail || !password}
                >
                    {loading && (
                        <Loader2Icon className="animate-spin" />
                    )}
                    Login
                </Button>
            </div>
            <div className="text-center text-sm">
                Don&apos;t have an account?{" "}
                <a href="/sign-up" className="underline underline-offset-4">
                    Sign up
                </a>
            </div>
        </form>
    )
}

export default LoginForm