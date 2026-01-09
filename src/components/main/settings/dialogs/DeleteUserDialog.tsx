'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Separator } from '@/components/ui/separator'
import { useSession } from 'next-auth/react'
import { toast } from 'sonner'
import { Loader2Icon } from 'lucide-react'
import { deleteUserAdmin } from '@/services/firebase/admin-delete'
import { withTokenRefresh } from '@/utils/token-refresh'
import { useRouter } from 'next/navigation'
import { removeAllCookies } from '@/utils/cookie-handlers'


const DeleteUserDialog = () => {
    const router = useRouter();
    const { data: session } = useSession();
    const [email, setEmail] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const isOwner = session?.user.organisation?.role === "owner";

    async function handleSubmit() {
        if (!email.trim()) {
            toast("Email is required", {
                description: "Please enter your email to confirm account deletion."
            });
            return;
        }
        if (session?.user?.email !== email) {
            toast("Incorrect email", {
                description: "The email you entered does not match your account. Please try again."
            });
            return;
        }

        setIsSubmitting(true);

        // Step 1: Delete cookies
        removeAllCookies()

        // Step 2: Delete user
        try {
            await withTokenRefresh((idToken) => deleteUserAdmin({ idToken }));

            toast("User deleted", {
                description: "Your account has been permanently deleted.",
            });

            router.push("/")
        } catch {
            toast("Failed to delete account", {
                description: "Something went wrong while deleting your account. Please try again.",
            });
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" >
                    Delete user
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle className='mb-2'>Delete user</DialogTitle>
                    <Separator />
                </DialogHeader>
                <div className="space-y-6 text-sm text-muted-foreground py-4">
                    <p>
                        Deleting your account is permanent and cannot be undone.
                    </p>
                    <ul className="space-y-3">
                        {/* Always applies */}
                        <li className="grid grid-cols-12 items-center">
                            <span className="text-2xl col-span-1">•</span>
                            <span className="col-span-11">
                                Your personal account data will be permanently deleted and cannot be recovered.
                            </span>
                        </li>

                        {isOwner && (
                            <>
                                <li className="grid grid-cols-12 items-center">
                                    <span className="text-2xl col-span-1">•</span>
                                    <span className="col-span-11">
                                        The organisation you own will also be permanently deleted.
                                    </span>
                                </li>
                                <li className="grid grid-cols-12 items-center">
                                    <span className="text-2xl col-span-1">•</span>
                                    <span className="col-span-11">
                                        All current members will not be deleted, but they will have this organisation removed from their account.
                                    </span>
                                </li>
                                <li className="grid grid-cols-12 items-center">
                                    <span className="text-2xl col-span-1">•</span>
                                    <span className="col-span-11">
                                        Only billing and payment data will remain, securely stored by Stripe for compliance.
                                    </span>
                                </li>
                            </>
                        )}
                    </ul>
                    <p className="font-medium text-destructive">
                        This action is irreversible. Please be certain before proceeding.
                    </p>
                </div>

                <div className="grid gap-4 py-4">
                    <Input
                        id="key-name"
                        type="text"
                        name="confirm-email-no-autofill"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your email to confirm"
                        onPaste={(e) => e.preventDefault()}
                        autoComplete="off"
                    />
                </div>

                <DialogFooter>
                    <Button onClick={handleSubmit} disabled={!email}>
                        {isSubmitting && <Loader2Icon className="animate-spin" />}
                        {isSubmitting ? 'Deleting...' : 'Delete'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export default DeleteUserDialog
