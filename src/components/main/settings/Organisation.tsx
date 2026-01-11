"use client";

// Local Imports
import { IUser } from '@/models/user';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Button } from '../../ui/button';
import { IOrganisation } from '@/models/organisation';
import CreateOrganisation from './CreateOrganisation';
import { useOrganisation } from '@/hooks/useOrganisation';
import { CurrencyCombobox } from '@/components/ui/currency-combobox';
import { updateOrganisation } from '@/services/firebase/update';
import { Card, CardContent, CardFooter } from '../../ui/card';
import ImageUploadDialog from './dialogs/ImageUploadDialog';
import { levelFourAccess, levelThreeAccess } from '@/constants/access';

// External Imports
import { formatDistanceToNow } from 'date-fns'
import { useState } from 'react'
import { Camera, Loader2Icon } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { toast } from 'sonner'
import Image from 'next/image';

const Organisation = () => {
    // Hooks
    const { data: session } = useSession();
    const { organisation, refetch } = useOrganisation();

    // States
    const [changes, setChanges] = useState<Partial<IOrganisation>>({});
    const [loading, setLoading] = useState(false);
    const [imageDialogOpen, setImageDialogOpen] = useState(false);

    const hasLevelThreeAccess = levelThreeAccess.includes(session?.user.organisation?.role as string);
    const hasLevelFourAccess = levelFourAccess.includes(session?.user.organisation?.role as string);

    // Merge organisation with any pending changes
    const updateOrg = organisation ? { ...organisation, ...changes } : undefined;

    const handleChange = (key: keyof IOrganisation, value: unknown) => {
        setChanges((prev) => ({ ...prev, [key]: value }))
    }

    async function handleSave() {
        if (!hasLevelFourAccess) return;

        setLoading(true);

        const { error } = await updateOrganisation({ organisation: updateOrg as IOrganisation })

        if (error) {
            toast.error("Failed to update user", {
                description: error,
            });
        } else {
            toast.success("Organisation updated successfully");
            setChanges({}); // Clear changes after successful save
        }
        refetch()

        setLoading(false);
    }

    // Get organisation initials
    const getOrgInitials = () => {
        if (updateOrg?.name) {
            const words = updateOrg.name.trim().split(/\s+/);
            if (words.length >= 2) {
                return `${words[0][0]}${words[1][0]}`.toUpperCase();
            }
            return updateOrg.name.substring(0, 2).toUpperCase();
        }
        return "ORG";
    };

    const handleOpenImageDialog = () => {
        if (!hasLevelFourAccess) return;
        setImageDialogOpen(true);
    };

    const handleSaveImage = (imageUrl: string) => {
        handleChange("brand", { imageUrl });
    };

    return (
        <div className='space-y-4'>
            <div>
                <h3 className="text-lg font-medium">Organisation</h3>
                <p className="text-muted-foreground text-sm">Your organisation information</p>
            </div>

            {organisation && (
                <>
                    <Card>
                        <CardContent className="grid gap-4">
                            {/* Organisation Logo */}
                            <div className="flex items-center gap-4">
                                <div
                                    className={`shrink-0 relative group ${hasLevelFourAccess ? 'cursor-pointer' : 'cursor-not-allowed'}`}
                                    onClick={handleOpenImageDialog}
                                >
                                    {updateOrg?.brand?.imageUrl ? (
                                        <Image
                                            src={updateOrg.brand.imageUrl}
                                            alt="Organisation Logo"
                                            width={500}
                                            height={500}
                                            className="w-20 h-20 rounded-lg object-cover border-2 border-border"
                                        />
                                    ) : (
                                        <div className="w-20 h-20 rounded-lg border-2 border-border flex items-center justify-center bg-muted">
                                            <span className="text-2xl font-semibold text-muted-foreground">
                                                {getOrgInitials()}
                                            </span>
                                        </div>
                                    )}
                                    {/* Hover overlay - only show for users with permission */}
                                    {hasLevelFourAccess && (
                                        <div className="absolute inset-0 bg-black/60 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <Camera className="w-8 h-8 text-white" />
                                        </div>
                                    )}
                                </div>
                            </div>

                            {hasLevelThreeAccess && (
                                <div className="grid gap-2">
                                    <Label>ID</Label>
                                    <Input
                                        value={organisation?.id || ""}
                                        readOnly
                                    />
                                </div>
                            )}
                            <div className="grid gap-2">
                                <Label>Name</Label>
                                <Input
                                    value={updateOrg?.name || ""}
                                    onChange={(e) => handleChange("name", e.target.value)}
                                    readOnly={!hasLevelFourAccess}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label>Currency</Label>
                                <CurrencyCombobox
                                    value={updateOrg?.currency || ""}
                                    onValueChange={(value) => handleChange("currency", value)}
                                    readOnly={!hasLevelFourAccess}
                                />
                            </div>
                        </CardContent>
                        {hasLevelFourAccess && (
                            <CardFooter className="justify-end">
                                <Button onClick={handleSave} disabled={loading}>
                                    {loading && <Loader2Icon className="animate-spin" />}
                                    {loading ? "Updating" : "Save Changes"}
                                </Button>
                            </CardFooter>
                        )}
                    </Card>
                    <div className="text-muted-foreground text-sm w-full flex justify-between px-4">
                        <div>
                            {organisation?.members} active member{(organisation?.members && organisation?.members > 1) ? "s" : ""}
                        </div>
                        <div>
                            Created {updateOrg?.createdAt
                                ? formatDistanceToNow(updateOrg.createdAt, { addSuffix: true })
                                : "N/A"}
                        </div>
                    </div>
                </>
            )}

            {!organisation && (
                <CreateOrganisation refetch={refetch} user={session?.user as IUser} />
            )}

            {/* Image Upload Dialog */}
            <ImageUploadDialog
                open={imageDialogOpen}
                onOpenChange={setImageDialogOpen}
                title="Update Organisation Logo"
                description="Enter the URL of your organisation logo"
                currentImageUrl={updateOrg?.brand?.imageUrl}
                onSave={handleSaveImage}
                imageShape="square"
            />
        </div>
    )
}

export default Organisation
