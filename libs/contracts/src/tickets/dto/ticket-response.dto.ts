import {TicketStatus} from "@app/contracts/tickets";


export class TicketResponseDto {
    id: string;

    eventTitle: string;

    eventDate: string;

    ticketCode: string;

    quantity: number;

    totalPrice: number;

    status: TicketStatus;

    purchasedAt: string;
}