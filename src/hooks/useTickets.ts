"use client";

// External Imports
import { useState, useEffect, useCallback } from "react";

// Local Imports
import { ITicket } from "@/models/ticket";
import { retrieveTickets } from "@/services/firebase/tickets/retrieve";
import { ticketsCookieKey } from "@/constants/cookies";
import { getSessionStorage, setSessionStorage } from "@/utils/storage-handlers";
import { useEntities } from "./useEntities";

interface UseTicketsReturn {
    ticketsByEntity: Record<string, ITicket[]> | null;
    loading: boolean;
    error: string | null;
    refetch: () => Promise<void>;
}

export function useTickets(organisationId: string | null): UseTicketsReturn {
    const { entities } = useEntities(organisationId);
    const [ticketsByEntity, setTicketsByEntity] = useState<Record<string, ITicket[]> | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const fetchTickets = useCallback(
        async ({ reload = false } = {}) => {
            if (!organisationId) {
                setTicketsByEntity(null);
                setError("No organisation ID provided");
                return;
            }

            if (!entities || entities.length === 0) {
                setTicketsByEntity({});
                return;
            }

            setLoading(true);
            setError(null);

            try {
                const storageKey = `${organisationId}_${ticketsCookieKey}`;

                // Step 1: Try sessionStorage cache
                if (!reload) {
                    const cached = getSessionStorage(storageKey);
                    if (cached) {
                        setTicketsByEntity(JSON.parse(cached));
                        setLoading(false);
                        return;
                    }
                }

                // Step 2: Fetch tickets for each entity
                const ticketsDict: Record<string, ITicket[]> = {};

                await Promise.all(
                    entities.map(async (entity) => {
                        const { tickets: fetched, error: err } = await retrieveTickets({
                            organisationId,
                            entityId: entity.id,
                        });

                        if (!err && fetched) {
                            ticketsDict[entity.id] = fetched;
                        }
                    })
                );

                setTicketsByEntity(ticketsDict);
                // Step 3: Cache in sessionStorage (persists for the session)
                setSessionStorage(storageKey, JSON.stringify(ticketsDict));
            } catch (err) {
                setError(err instanceof Error ? err.message : "Failed to fetch tickets");
                setTicketsByEntity(null);
            } finally {
                setLoading(false);
            }
        },
        [organisationId, entities]
    );

    useEffect(() => {
        fetchTickets();
    }, [fetchTickets]);

    const refetch = useCallback(async () => {
        await fetchTickets({ reload: true });
    }, [fetchTickets]);

    return { ticketsByEntity, loading, error, refetch };
}
