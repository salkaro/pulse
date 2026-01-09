"use server";

// Local Imports
import { ITicket } from "@/models/ticket";
import { firestoreAdmin } from "@/lib/firebase/config-admin";
import { getTicketsPath } from "@/constants/collections";

export async function retrieveTickets({
    organisationId,
    entityId,
}: {
    organisationId: string;
    entityId: string;
}): Promise<{ tickets: ITicket[] | null; error: string | null }> {
    try {
        // Use subcollection path: organisations/{organisationId}/entities/{entityId}/tickets
        const ticketsPath = getTicketsPath(organisationId, entityId);
        const snapshot = await firestoreAdmin
            .collection(ticketsPath)
            .orderBy("createdAt", "desc")
            .get();

        if (snapshot.empty) {
            return { tickets: [], error: null };
        }

        const tickets = snapshot.docs.map((doc) => doc.data() as ITicket);

        return { tickets, error: null };
    } catch (error) {
        console.error("Error retrieving tickets:", error);
        return {
            tickets: null,
            error: error instanceof Error ? error.message : "Failed to retrieve tickets",
        };
    }
}

export async function retrieveTicket({
    organisationId,
    entityId,
    ticketId,
}: {
    organisationId: string;
    entityId: string;
    ticketId: string;
}): Promise<{ ticket: ITicket | null; error: string | null }> {
    try {
        // Use subcollection path: organisations/{organisationId}/entities/{entityId}/tickets
        const ticketsPath = getTicketsPath(organisationId, entityId);
        const docRef = firestoreAdmin.collection(ticketsPath).doc(ticketId);
        const snapshot = await docRef.get();

        if (!snapshot.exists) {
            return { ticket: null, error: "Ticket not found" };
        }

        const ticket = snapshot.data() as ITicket;

        return { ticket, error: null };
    } catch (error) {
        console.error("Error retrieving ticket:", error);
        return {
            ticket: null,
            error: error instanceof Error ? error.message : "Failed to retrieve ticket",
        };
    }
}
