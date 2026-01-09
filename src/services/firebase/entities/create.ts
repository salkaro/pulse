"use server";

// Local Imports
import { IEntity } from "@/models/entity";
import { firestoreAdmin } from "@/lib/firebase/config-admin";
import { getEntitiesPath, organisationsCol } from "@/constants/collections";
import { FieldValue } from "firebase-admin/firestore";

export async function createEntity({
    organisationId,
    name,
    description,
    logoPrimary,
}: {
    organisationId: string;
    name: string;
    description?: string;
    logoPrimary?: string;
}): Promise<{ entity?: IEntity; error?: string }> {
    try {
        // Use subcollection path: organisations/{organisationId}/entities
        const entitiesPath = getEntitiesPath(organisationId);
        const entityRef = firestoreAdmin.collection(entitiesPath).doc();
        const now = Date.now();

        const entity: IEntity = {
            id: entityRef.id,
            name,
            createdAt: now,
            ...(description && { description }),
            ...(logoPrimary && {
                images: {
                    logo: {
                        primary: logoPrimary,
                    },
                },
            }),
        };

        await entityRef.set(entity);

        // Increment entities count on organisation
        const orgRef = firestoreAdmin.collection(organisationsCol).doc(organisationId);
        await orgRef.update({
            entities: FieldValue.increment(1),
        });

        return { entity };
    } catch (error) {
        console.error("Error creating entity:", error);
        return { error: error instanceof Error ? error.message : "Failed to create entity" };
    }
}

// Legacy alias for backwards compatibility
export const createProduct = createEntity;
