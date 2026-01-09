"use client"

// Local Imports
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"

// External Imports
import { useState } from "react"
import Image from "next/image"

interface ImageUploadDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    title: string
    description: string
    currentImageUrl?: string | null
    onSave: (imageUrl: string) => void
    imageShape?: "circle" | "square"
}

const ImageUploadDialog = ({
    open,
    onOpenChange,
    title,
    description,
    currentImageUrl,
    onSave,
    imageShape = "circle"
}: ImageUploadDialogProps) => {
    const [tempImageUrl, setTempImageUrl] = useState("");

    // Update temp URL when dialog opens
    const handleOpenChange = (isOpen: boolean) => {
        if (isOpen) {
            setTempImageUrl(currentImageUrl || "");
        }
        onOpenChange(isOpen);
    };

    const handleSave = () => {
        onSave(tempImageUrl);
        onOpenChange(false);
    };

    const roundedClass = imageShape === "circle" ? "rounded-full" : "rounded-lg";

    // Validate URL
    const isValidUrl = (urlString: string): boolean => {
        if (!urlString) return false;
        try {
            const url = new URL(urlString);
            return url.protocol === "http:" || url.protocol === "https:";
        } catch {
            return false;
        }
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>{description}</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="imageUrl">Image URL</Label>
                        <Input
                            id="imageUrl"
                            type="url"
                            width={500}
                            height={500}
                            placeholder="https://example.com/image.jpg"
                            value={tempImageUrl}
                            onChange={(e) => setTempImageUrl(e.target.value)}
                        />
                    </div>
                    {isValidUrl(tempImageUrl) && (
                        <div className="flex justify-center">
                            <Image
                                src={tempImageUrl}
                                alt="Preview"
                                width={500}
                                height={500}
                                className={`w-32 h-32 ${roundedClass} object-cover border-2 border-border`}
                                onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                }}
                            />
                        </div>
                    )}
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button onClick={handleSave}>
                        Save
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export default ImageUploadDialog
