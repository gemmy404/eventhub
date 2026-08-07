import {TicketStatus} from "@app/contracts/tickets";


export class EventTicketResponseDto {
    id: string;

    ticketCode: string;

    quantity: number;

    totalPrice: number;

    status: TicketStatus;

    purchasedAt: string;

    ticketOwnerEmail: string;

    ticketOwnerName: string;
}