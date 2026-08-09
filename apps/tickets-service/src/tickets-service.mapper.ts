import {Event, Prisma, Ticket} from "@prisma/client";
import {EventResponseDto, EventTicketResponseDto, TicketResponseDto, TicketStatus} from "@app/contracts";


type TicketWithOwner = Prisma.TicketGetPayload<{
    include: {
        user: {
            select: {
                name: true,
                email: true,
            }
        }
    }
}>;

export class TicketsServiceMapper {

    private constructor() {
    }

    static toTicketResponseDto(ticket: Ticket, event: Event | EventResponseDto): TicketResponseDto {
        return {
            id: ticket.id,
            eventTitle: event.title,
            eventDate: event.date.toLocaleString(),
            ticketCode: ticket.ticketCode,
            quantity: ticket.quantity,
            totalPrice: ticket.totalPrice,
            status: ticket.status as TicketStatus,
            purchasedAt: ticket.purchasedAt.toLocaleString(),
        };
    }

    static toEventTicketResponseDto(ticket: TicketWithOwner): EventTicketResponseDto {
        return {
            id: ticket.id,
            ticketCode: ticket.ticketCode,
            quantity: ticket.quantity,
            totalPrice: ticket.totalPrice,
            status: ticket.status as TicketStatus,
            purchasedAt: ticket.purchasedAt.toLocaleString(),
            ticketOwnerEmail: ticket.user.email,
            ticketOwnerName: ticket.user.name,
        };
    }

}