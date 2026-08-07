export class TicketPurchasedEvent {
    ticketId: string;
    ticketCode: string;

    email: string;
    name: string;

    eventTitle: string;
    eventDate: Date;
    eventLocation: string;

    quantity: number;
    totalPrice: number;
}