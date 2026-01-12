"use client"

// Local Imports
import { useEntities } from "@/hooks/useEntities"
import { useOrganisation } from "@/hooks/useOrganisation"
import { IEntity } from "@/models/entity"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { updateEntity } from "@/services/firebase/entities/update"

// External Imports
import { useSearchParams } from "next/navigation"
import Image from "next/image"
import { ImageIcon, Download, ExternalLink, Trash2, Copy, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import ImageUploadDialog from "@/components/main/settings/dialogs/ImageUploadDialog"
import { toast } from "sonner"
import { useSession } from "next-auth/react"
import { levelTwoAccess } from "@/constants/access"

// Helper component for individual image slot
const ImageSlot = ({
    label,
    imageUrl,
    onUpload,
    onDelete,
    canEdit = true
}: {
    label: string;
    imageUrl?: string;
    onUpload: () => void;
    onDelete?: () => void;
    canEdit?: boolean;
}) => {
    const [copied, setCopied] = useState(false)

    const handleCopyUrl = (e: React.MouseEvent) => {
        e.stopPropagation()
        if (imageUrl) {
            navigator.clipboard.writeText(imageUrl)
            toast.success("Image URL copied to clipboard")
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        }
    }

    return (
        <div className="relative aspect-video w-full bg-muted rounded-lg overflow-hidden border group hover:border-primary transition-colors">
            {imageUrl ? (
                <>
                    <div className={canEdit ? "cursor-pointer w-full h-full" : "w-full h-full"} onClick={canEdit ? onUpload : undefined}>
                        <Image
                            src={imageUrl}
                            alt={label}
                            fill
                            className="object-contain"
                        />
                        {/* Hover overlay */}
                        {canEdit && (
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <ImageIcon className="w-8 h-8 text-white" />
                            </div>
                        )}
                    </div>
                    {/* Copy button */}
                    <Button
                        variant={copied ? "default" : "secondary"}
                        size="icon"
                        className="absolute top-2 left-2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-all z-10"
                        onClick={handleCopyUrl}
                    >
                        {copied ? (
                            <Check className="h-4 w-4 animate-in zoom-in-50 duration-200" />
                        ) : (
                            <Copy className="h-4 w-4" />
                        )}
                    </Button>
                    {/* Delete button */}
                    {onDelete && canEdit && (
                        <Button
                            variant="destructive"
                            size="icon"
                            className="absolute top-2 right-2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                            onClick={(e) => {
                                e.stopPropagation()
                                onDelete()
                            }}
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    )}
                </>
            ) : (
                canEdit ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-4 cursor-pointer" onClick={onUpload}>
                        <ImageIcon className="h-8 w-8 text-muted-foreground mb-2 group-hover:text-primary transition-colors" />
                        <p className="text-xs text-muted-foreground text-center group-hover:text-primary transition-colors">
                            {label}
                        </p>
                    </div>
                ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
                        <ImageIcon className="h-8 w-8 text-muted-foreground/50 mb-2" />
                        <p className="text-xs text-muted-foreground/50 text-center">
                            No image
                        </p>
                    </div>
                )
            )}
        </div>
    )
}

// Helper for gallery/array images
const GalleryCard = ({ title, images, description }: { title: string; images?: string[]; description?: string }) => {
    if (!images || images.length === 0) return null

    return (
        <Card className="overflow-hidden md:col-span-2 lg:col-span-3">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="text-sm font-medium">{title}</CardTitle>
                        {description && (
                            <CardDescription className="text-xs">{description}</CardDescription>
                        )}
                    </div>
                    <Badge variant="secondary">{images.length} images</Badge>
                </div>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {images.map((imageUrl, idx) => (
                        <div key={idx} className="space-y-2">
                            <div className="relative aspect-video w-full bg-muted rounded-lg overflow-hidden border">
                                <Image
                                    src={imageUrl}
                                    alt={`${title} ${idx + 1}`}
                                    fill
                                    className="object-contain"
                                />
                            </div>
                            <div className="flex gap-1">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="flex-1 text-xs h-7"
                                    asChild
                                >
                                    <a href={imageUrl} target="_blank" rel="noopener noreferrer">
                                        <ExternalLink className="h-2 w-2 mr-1" />
                                        View
                                    </a>
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}

const Page = () => {
    const searchParams = useSearchParams()
    const id = searchParams.get("id")
    const { data: session } = useSession()
    const { organisation } = useOrganisation()
    const { entities, loading, refetch } = useEntities(organisation?.id as string)

    // Find the entity matching the id from the query
    const entity: IEntity | undefined = entities?.find(e => e.id === id)

    // Access control
    const hasEditAccess = levelTwoAccess.includes(session?.user.organisation?.role as string)

    // Image upload dialog state
    const [imageDialogOpen, setImageDialogOpen] = useState(false)
    const [currentImagePath, setCurrentImagePath] = useState<string>("")
    const [currentImageTitle, setCurrentImageTitle] = useState<string>("")
    const [currentImageUrl, setCurrentImageUrl] = useState<string | null>(null)

    // Handle opening the upload dialog
    const handleOpenUploadDialog = (path: string, title: string, currentUrl?: string) => {
        setCurrentImagePath(path)
        setCurrentImageTitle(title)
        setCurrentImageUrl(currentUrl || null)
        setImageDialogOpen(true)
    }

    // Handle saving the image URL
    const handleSaveImage = async (imageUrl: string) => {
        if (!organisation?.id || !entity?.id) {
            toast.error("Missing organisation or entity information")
            return
        }

        try {
            const result = await updateEntity({
                organisationId: organisation.id,
                entityId: entity.id,
                imagePath: currentImagePath,
                imageUrl: imageUrl,
            })

            if (result.error) {
                throw new Error(result.error)
            }

            toast.success(`${currentImageTitle} updated successfully`)

            // Refresh the entities data
            await refetch()

            // Close the dialog
            setImageDialogOpen(false)
        } catch (error) {
            console.error("Error saving image:", error)
            toast.error(error instanceof Error ? error.message : "Failed to save image")
        }
    }

    // Handle deleting an image
    const handleDeleteImage = async (path: string, title: string) => {
        if (!organisation?.id || !entity?.id) {
            toast.error("Missing organisation or entity information")
            return
        }

        try {
            const result = await updateEntity({
                organisationId: organisation.id,
                entityId: entity.id,
                imagePath: path,
                imageUrl: "",
            })

            if (result.error) {
                throw new Error(result.error)
            }

            toast.success(`${title} removed successfully`)

            // Refresh the entities data
            await refetch()
        } catch (error) {
            console.error("Error deleting image:", error)
            toast.error(error instanceof Error ? error.message : "Failed to remove image")
        }
    }

    if (loading) {
        return (
            <div className="space-y-6 p-4">
                <Skeleton className="h-10 w-64" />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Array.from({ length: 9 }).map((_, i) => (
                        <Skeleton key={i} className="h-64 w-full" />
                    ))}
                </div>
            </div>
        )
    }

    if (!entity) {
        return (
            <div className="space-y-4 p-4">
                <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                        <ImageIcon className="h-12 w-12 text-muted-foreground mb-4" />
                        <p className="text-muted-foreground text-center">
                            Entity not found
                        </p>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="space-y-6 p-4">
            {/* Logo Section */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Logos</CardTitle>
                    <CardDescription>Brand identity logos for different use cases</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <ImageSlot
                            label="Primary Logo"
                            imageUrl={entity.images?.logo.primary}
                            onUpload={() => handleOpenUploadDialog("images.logo.primary", "Primary Logo", entity.images?.logo.primary)}
                            onDelete={() => handleDeleteImage("images.logo.primary", "Primary Logo")}
                        />
                        <ImageSlot
                            label="Inverted Logo"
                            imageUrl={entity.images?.logo.inverted}
                            onUpload={() => handleOpenUploadDialog("images.logo.inverted", "Inverted Logo", entity.images?.logo.inverted)}
                            onDelete={() => handleDeleteImage("images.logo.inverted", "Inverted Logo")}
                        />
                        <ImageSlot
                            label="Icon"
                            imageUrl={entity.images?.logo.icon}
                            onUpload={() => handleOpenUploadDialog("images.logo.icon", "Icon", entity.images?.logo.icon)}
                            onDelete={() => handleDeleteImage("images.logo.icon", "Icon")}
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Profile Section */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Profile Images</CardTitle>
                    <CardDescription>Profile pictures and avatars</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <ImageSlot
                            label="Square Avatar"
                            imageUrl={entity.images?.profile?.square}
                            onUpload={() => handleOpenUploadDialog("images.profile.square", "Square Avatar", entity.images?.profile?.square)}
                            onDelete={() => handleDeleteImage("images.profile.square", "Square Avatar")}
                        />
                        <ImageSlot
                            label="Round Avatar"
                            imageUrl={entity.images?.profile?.round}
                            onUpload={() => handleOpenUploadDialog("images.profile.round", "Round Avatar", entity.images?.profile?.round)}
                            onDelete={() => handleDeleteImage("images.profile.round", "Round Avatar")}
                        />
                        <ImageSlot
                            label="Favicon"
                            imageUrl={entity.images?.profile?.favicon}
                            onUpload={() => handleOpenUploadDialog("images.profile.favicon", "Favicon", entity.images?.profile?.favicon)}
                            onDelete={() => handleDeleteImage("images.profile.favicon", "Favicon")}
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Banners Section */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Banners</CardTitle>
                    <CardDescription>Marketing and promotional banner images</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <ImageSlot
                            label="Hero Banner"
                            imageUrl={entity.images?.banners?.hero}
                            onUpload={() => handleOpenUploadDialog("images.banners.hero", "Hero Banner", entity.images?.banners?.hero)}
                            onDelete={() => handleDeleteImage("images.banners.hero", "Hero Banner")}
                        />
                        <ImageSlot
                            label="Dashboard Header"
                            imageUrl={entity.images?.banners?.dashboard}
                            onUpload={() => handleOpenUploadDialog("images.banners.dashboard", "Dashboard Header", entity.images?.banners?.dashboard)}
                            onDelete={() => handleDeleteImage("images.banners.dashboard", "Dashboard Header")}
                        />
                        <ImageSlot
                            label="Email Banner"
                            imageUrl={entity.images?.banners?.email}
                            onUpload={() => handleOpenUploadDialog("images.banners.email", "Email Banner", entity.images?.banners?.email)}
                            onDelete={() => handleDeleteImage("images.banners.email", "Email Banner")}
                        />
                        <ImageSlot
                            label="Social Sharing"
                            imageUrl={entity.images?.banners?.social}
                            onUpload={() => handleOpenUploadDialog("images.banners.social", "Social Sharing", entity.images?.banners?.social)}
                            onDelete={() => handleDeleteImage("images.banners.social", "Social Sharing")}
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Social Media Section */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Social Media</CardTitle>
                    <CardDescription>Social media profile images</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <ImageSlot
                            label="Social Avatar"
                            imageUrl={entity.images?.social?.avatar}
                            onUpload={() => handleOpenUploadDialog("images.social.avatar", "Social Avatar", entity.images?.social?.avatar)}
                            onDelete={() => handleDeleteImage("images.social.avatar", "Social Avatar")}
                        />
                        <ImageSlot
                            label="Cover Image"
                            imageUrl={entity.images?.social?.cover}
                            onUpload={() => handleOpenUploadDialog("images.social.cover", "Cover Image", entity.images?.social?.cover)}
                            onDelete={() => handleDeleteImage("images.social.cover", "Cover Image")}
                        />
                    </div>
                </CardContent>
            </Card>

            {/* App Icons Section */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">App Icons</CardTitle>
                    <CardDescription>Application and platform icons</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <ImageSlot
                            label="iOS Icon"
                            imageUrl={entity.images?.appIcons?.ios}
                            onUpload={() => handleOpenUploadDialog("images.appIcons.ios", "iOS Icon", entity.images?.appIcons?.ios)}
                            onDelete={() => handleDeleteImage("images.appIcons.ios", "iOS Icon")}
                        />
                        <ImageSlot
                            label="Android Icon"
                            imageUrl={entity.images?.appIcons?.android}
                            onUpload={() => handleOpenUploadDialog("images.appIcons.android", "Android Icon", entity.images?.appIcons?.android)}
                            onDelete={() => handleDeleteImage("images.appIcons.android", "Android Icon")}
                        />
                        <ImageSlot
                            label="Web/PWA Icon"
                            imageUrl={entity.images?.appIcons?.web}
                            onUpload={() => handleOpenUploadDialog("images.appIcons.web", "Web/PWA Icon", entity.images?.appIcons?.web)}
                            onDelete={() => handleDeleteImage("images.appIcons.web", "Web/PWA Icon")}
                        />
                        <ImageSlot
                            label="Favicon"
                            imageUrl={entity.images?.appIcons?.favicon}
                            onUpload={() => handleOpenUploadDialog("images.appIcons.favicon", "Favicon", entity.images?.appIcons?.favicon)}
                            onDelete={() => handleDeleteImage("images.appIcons.favicon", "Favicon")}
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Marketplace Section */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Marketplace Images</CardTitle>
                    <CardDescription>App store listing images</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <ImageSlot
                            label="App Store"
                            imageUrl={entity.images?.marketplace?.appStore}
                            onUpload={() => handleOpenUploadDialog("images.marketplace.appStore", "App Store", entity.images?.marketplace?.appStore)}
                            onDelete={() => handleDeleteImage("images.marketplace.appStore", "App Store")}
                        />
                        <ImageSlot
                            label="Play Store"
                            imageUrl={entity.images?.marketplace?.playStore}
                            onUpload={() => handleOpenUploadDialog("images.marketplace.playStore", "Play Store", entity.images?.marketplace?.playStore)}
                            onDelete={() => handleDeleteImage("images.marketplace.playStore", "Play Store")}
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Gallery Section */}
            <GalleryCard
                title="Gallery"
                images={entity.images?.gallery}
                description="General brand images"
            />

            {/* Product Shots Section */}
            <GalleryCard
                title="Product Shots"
                images={entity.images?.productShots}
                description="Product-focused images"
            />

            {/* Press Kit Section */}
            {entity.images?.pressKit && (
                <div>
                    <h2 className="text-lg font-semibold mb-4">Press Kit</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm font-medium">Logo Pack</CardTitle>
                                <CardDescription className="text-xs">Download all logos</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Button variant="outline" className="w-full" asChild>
                                    <a href={entity.images.pressKit.logoPack} target="_blank" rel="noopener noreferrer">
                                        <Download className="h-4 w-4 mr-2" />
                                        Download Pack
                                    </a>
                                </Button>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm font-medium">Brand Guide</CardTitle>
                                <CardDescription className="text-xs">Brand guidelines PDF</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Button variant="outline" className="w-full" asChild>
                                    <a href={entity.images.pressKit.brandGuide} target="_blank" rel="noopener noreferrer">
                                        <Download className="h-4 w-4 mr-2" />
                                        Download Guide
                                    </a>
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            )}

            {/* Custom Images Section */}
            {entity.images?.custom && Object.keys(entity.images.custom).length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Custom Assets</CardTitle>
                        <CardDescription>Additional custom brand images</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {Object.entries(entity.images.custom).map(([key, imageUrl]) => (
                                <ImageSlot
                                    key={key}
                                    label={key.split(/(?=[A-Z])/).join(' ').replace(/^./, str => str.toUpperCase())}
                                    imageUrl={imageUrl}
                                    onUpload={() => handleOpenUploadDialog(`images.custom.${key}`, key, imageUrl)}
                                    onDelete={() => handleDeleteImage(`images.custom.${key}`, key)}
                                />
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Image Upload Dialog */}
            <ImageUploadDialog
                open={imageDialogOpen}
                onOpenChange={setImageDialogOpen}
                title={`Update ${currentImageTitle}`}
                description="Enter the URL of the image"
                currentImageUrl={currentImageUrl}
                onSave={handleSaveImage}
                imageShape="square"
            />
        </div>
    )
}

export default Page
