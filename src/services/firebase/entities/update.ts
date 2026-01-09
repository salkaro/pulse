"use server";

// Local Imports
import { IEntity, IEntityConnections } from "@/models/entity";
import { firestoreAdmin } from "@/lib/firebase/config-admin";
import { getEntitiesPath } from "@/constants/collections";

export async function updateEntity({
    organisationId,
    entityId,
    name,
    connections,
    imagePath,
    imageUrl,
    ticketId,
}: {
    organisationId: string;
    entityId: string;
    name?: string;
    connections?: Partial<IEntityConnections>;
    imagePath?: string;
    imageUrl?: string;
    ticketId?: string;
}): Promise<{ success?: boolean; error?: string }> {
    try {
        // Use subcollection path: organisations/{organisationId}/entities
        const entitiesPath = getEntitiesPath(organisationId);
        const entityRef = firestoreAdmin.collection(entitiesPath).doc(entityId);

        // Build update object dynamically
        const updates: Record<string, unknown> = {};

        if (name !== undefined) {
            updates.name = name;
        }

        if (connections !== undefined) {
            // Update connection fields individually
            Object.entries(connections).forEach(([key, value]) => {
                updates[`connections.${key}`] = value;
            });
        }

        if (imagePath !== undefined && imageUrl !== undefined) {
            // Update image at specific path (e.g., "images.logo.primary")
            updates[imagePath] = imageUrl;
        }

        if (ticketId !== undefined) {
            updates.ticketId = ticketId;
        }

        if (Object.keys(updates).length === 0) {
            return { error: "No fields to update" };
        }

        await entityRef.update(updates);

        return { success: true };
    } catch (error) {
        console.error("Error updating entity:", error);
        return { error: error instanceof Error ? error.message : "Failed to update entity" };
    }
}

// Legacy alias for backwards compatibility
export const updateProduct = updateEntity;
