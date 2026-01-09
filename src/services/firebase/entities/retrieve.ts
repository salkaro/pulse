"use server";

// Local Imports
import { IEntity } from "@/models/entity";
import { firestoreAdmin } from "@/lib/firebase/config-admin";
import { getEntitiesPath } from "@/constants/collections";

export async function retrieveEntities({
    organisationId,
}: {
    organisationId: string;
}): Promise<{ entities: IEntity[] | null; error: string | null }> {
    try {
        // Use subcollection path: organisations/{organisationId}/entities
        const entitiesPath = getEntitiesPath(organisationId);
        const snapshot = await firestoreAdmin
            .collection(entitiesPath)
            .orderBy("createdAt", "desc")
            .get();

        if (snapshot.empty) {
            return { entities: [], error: null };
        }

        const entities = snapshot.docs.map((doc) => doc.data() as IEntity);

        return { entities, error: null };
    } catch (error) {
        console.error("Error retrieving entities:", error);
        return {
            entities: null,
            error: error instanceof Error ? error.message : "Failed to retrieve entities",
        };
    }
}

export async function retrieveEntity({
    organisationId,
    entityId,
}: {
    organisationId: string;
    entityId: string;
}): Promise<{ entity: IEntity | null; error: string | null }> {
    try {
        // Use subcollection path: organisations/{organisationId}/entities
        const entitiesPath = getEntitiesPath(organisationId);
        const docRef = firestoreAdmin.collection(entitiesPath).doc(entityId);
        const snapshot = await docRef.get();

        if (!snapshot.exists) {
            return { entity: null, error: "Entity not found" };
        }

        const entity = snapshot.data() as IEntity;

        return { entity, error: null };
    } catch (error) {
        console.error("Error retrieving entity:", error);
        return {
            entity: null,
            error: error instanceof Error ? error.message : "Failed to retrieve entity",
        };
    }
}

// Legacy aliases for backwards compatibility
export const retrieveProducts = retrieveEntities;
export const retrieveProduct = retrieveEntity;
