import { ICustomer } from "./customer";

export type TicketTag = "normal" | "important" | "critical";
export type TicketStatus = "resolved" | "active";

interface ITicket {
    id: string;
    title: string;
    description: string;
    issueLocation: string;  // Url

    tag?: TicketTag;
    status: TicketStatus;

    customer: ICustomer;

    createdAt: number;
}



export type { ITicket }