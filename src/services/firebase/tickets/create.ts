"use server";

// Local Imports
import { ITicket, TicketTag } from "@/models/ticket";
import { ICustomer } from "@/models/customer";
import { firestoreAdmin } from "@/lib/firebase/config-admin";
import { getTicketsPath, getEntitiesPath, organisationsCol } from "@/constants/collections";

export async function createTicket({
    organisationId,
    entityId,
    title,
    description,
    issueLocation,
    tag,
    customer,
}: {
    organisationId: string;
    entityId: string;
    title: string;
    description: string;
    issueLocation: string;
    tag?: TicketTag;
    customer: ICustomer;
}): Promise<{ ticket?: ITicket; error?: string }> {
    try {
        // Use subcollection path: organisations/{organisationId}/entities/{entityId}/tickets
        const ticketsPath = getTicketsPath(organisationId, entityId);
        const ticketRef = firestoreAdmin.collection(ticketsPath).doc();
        const now = Math.floor(Date.now() / 1000); // Unix timestamp in seconds

        const ticket: ITicket = {
            id: ticketRef.id,
            title,
            description,
            issueLocation,
            tag: tag || "normal",
            status: "active",
            customer,
            createdAt: now,
        };

        await ticketRef.set(ticket);

        return { ticket };
    } catch (error) {
        console.error("Error creating ticket:", error);
        return { error: error instanceof Error ? error.message : "Failed to create ticket" };
    }
}

// Helper function to get entity by entityId
export async function getEntityById({
    entityId,
}: {
    entityId: string;
}): Promise<{ organisationId?: string; entityName?: string; error?: string }> {
    try {
        // Query all organizations and their entities to find the one with this entityId
        const orgsSnapshot = await firestoreAdmin.collection(organisationsCol).get();

        for (const orgDoc of orgsSnapshot.docs) {
            const orgId = orgDoc.id;
            const entitiesPath = getEntitiesPath(orgId);
            const entityDoc = await firestoreAdmin
                .collection(entitiesPath)
                .doc(entityId)
                .get();

            if (entityDoc.exists) {
                const entityData = entityDoc.data();
                return {
                    organisationId: orgId,
                    entityName: entityData?.name,
                };
            }
        }

        return { error: "Entity not found" };
    } catch (error) {
        console.error("Error finding entity by entityId:", error);
        return { error: error instanceof Error ? error.message : "Failed to find entity" };
    }
}

// Legacy helper function to get entity by ticketId (for backwards compatibility)
export async function getEntityByTicketId({
    ticketId,
}: {
    ticketId: string;
}): Promise<{ organisationId?: string; entityId?: string; entityName?: string; error?: string }> {
    try {
        // Query all organizations and their entities to find the one with this ticketId
        const orgsSnapshot = await firestoreAdmin.collection(organisationsCol).get();

        for (const orgDoc of orgsSnapshot.docs) {
            const orgId = orgDoc.id;
            const entitiesPath = getEntitiesPath(orgId);
            const entitiesSnapshot = await firestoreAdmin
                .collection(entitiesPath)
                .where("ticketId", "==", ticketId)
                .limit(1)
                .get();

            if (!entitiesSnapshot.empty) {
                const entityDoc = entitiesSnapshot.docs[0];
                const entityData = entityDoc.data();
                return {
                    organisationId: orgId,
                    entityId: entityDoc.id,
                    entityName: entityData.name,
                };
            }
        }

        return { error: "Ticket page not found" };
    } catch (error) {
        console.error("Error finding entity by ticketId:", error);
        return { error: error instanceof Error ? error.message : "Failed to find ticket page" };
    }
}
