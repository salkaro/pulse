"use client"

// Local imports
import { IUser } from "@/models/user"
import { Label } from "../../ui/label"
import { Input } from "../../ui/input"
import { Button } from "../../ui/button"
import { Separator } from "../../ui/separator"
import { updateUser } from "@/services/firebase/update"
import DeleteUserDialog from "./dialogs/DeleteUserDialog"
import ImageUploadDialog from "./dialogs/ImageUploadDialog"
import { Card, CardContent, CardFooter } from "@/components/ui/card"

// External Imports
import { formatDistanceToNow } from "date-fns"
import { Camera, Loader2Icon } from "lucide-react"
import { useSession } from "next-auth/react"
import { useState } from "react"
import { toast } from "sonner"
import { ModeToggle } from "@/components/theme-toggle"
import Image from "next/image"

const Overview = () => {
    const { data: session } = useSession();
    const [loading, setLoading] = useState(false);
    const [imageDialogOpen, setImageDialogOpen] = useState(false);

    // Derive initial user from session, but allow local edits
    const sessionUser = session?.user as IUser | undefined;
    const [userEdits, setUserEdits] = useState<Partial<IUser>>({});

    // Merge session user with local edits
    const user = sessionUser ? { ...sessionUser, ...userEdits } : undefined;

    const handleChange = (key: keyof IUser, value: unknown) => {
        setUserEdits((prev) => ({ ...prev, [key]: value }))
    }

    async function handleSave() {
        setLoading(true);
        const { error } = await updateUser({ user: user as IUser });

        if (error) {
            toast.error("Failed to update user", {
                description: error,
            });
        } else {
            toast.success("Profile updated successfully");
        }

        setLoading(false);
    }

    // Get user initials
    const getUserInitials = () => {
        if (user?.firstname && user?.lastname) {
            return `${user.firstname[0]}${user.lastname[0]}`.toUpperCase();
        } else if (user?.firstname) {
            return user.firstname[0].toUpperCase();
        } else if (user?.email) {
            return user.email[0].toUpperCase();
        }
        return "U";
    };

    const handleOpenImageDialog = () => {
        setImageDialogOpen(true);
    };

    const handleSaveImage = (imageUrl: string) => {
        handleChange("brand", { imageUrl });
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between w-full">
                <div>
                    <h3 className="text-lg font-medium">Personal</h3>
                    <p className="text-muted-foreground text-sm">Your personal information</p>
                </div>
                <ModeToggle />
            </div>

            <Card>
                <CardContent className="grid gap-4">
                    {/* Profile Image */}
                    <div className="flex items-center gap-4">
                        <div
                            className="shrink-0 relative cursor-pointer group"
                            onClick={handleOpenImageDialog}
                        >
                            {user?.brand?.imageUrl ? (
                                <Image
                                    src={user.brand.imageUrl}
                                    alt="Profile"
                                    width={500}
                                    height={500}
                                    className="w-20 h-20 rounded-full object-cover border-2 border-border"
                                />
                            ) : (
                                <div className="w-20 h-20 rounded-full border-2 border-border flex items-center justify-center bg-muted">
                                    <span className="text-2xl font-semibold text-muted-foreground">
                                        {getUserInitials()}
                                    </span>
                                </div>
                            )}
                            {/* Hover overlay */}
                            <div className="absolute inset-0 bg-black/60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <Camera className="w-8 h-8 text-white" />
                            </div>
                        </div>
                        <div className="flex-1">
                            <p className="text-sm font-medium">Profile Picture</p>
                            <p className="text-xs text-muted-foreground">Click to upload image</p>
                        </div>
                    </div>

                    <div className="grid gap-2">
                        <Label>First Name</Label>
                        <Input
                            value={user?.firstname || ""}
                            onChange={(e) => handleChange("firstname", e.target.value)}
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label>Last Name</Label>
                        <Input
                            value={user?.lastname || ""}
                            onChange={(e) => handleChange("lastname", e.target.value)}
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label>Email</Label>
                        <Input
                            type="email"
                            value={user?.email || ""}
                            onChange={(e) => handleChange("email", e.target.value)}
                        />
                    </div>
                </CardContent>
                <CardFooter className="justify-end">
                    <Button onClick={handleSave} disabled={loading}>
                        {loading && <Loader2Icon className="animate-spin" />}
                        {loading ? "Updating" : "Save Changes"}
                    </Button>
                </CardFooter>
            </Card>
            <div className="text-muted-foreground text-sm w-full flex justify-end pr-4">
                Joined {user?.metadata?.createdAt
                    ? formatDistanceToNow(user?.metadata.createdAt, { addSuffix: true })
                    : "N/A"}
            </div>

            <div>
                <h3 className="text-lg font-medium">Danger zone</h3>
                <p className="text-muted-foreground text-sm">Irreversible and destructive actions</p>
            </div>
            <Card>
                <CardContent>
                    <h1 className="text-lg font-medium mb-2">Delete user</h1>
                    <Separator />
                    <p className="my-6 text-muted-foreground">Once your account is deleted, it cannot be recovered. Please make sure you&apos;re absolutely certain.</p>
                    <DeleteUserDialog />
                </CardContent>
            </Card>

            {/* Image Upload Dialog */}
            <ImageUploadDialog
                open={imageDialogOpen}
                onOpenChange={setImageDialogOpen}
                title="Update Profile Picture"
                description="Enter the URL of your profile image"
                currentImageUrl={user?.brand?.imageUrl}
                onSave={handleSaveImage}
                imageShape="circle"
            />
        </div>
    )
}

export default Overview
