import {
    BadRequestException,
    ForbiddenException,
    Inject,
    Injectable,
    NotFoundException,
    OnModuleInit
} from '@nestjs/common';
import {KAFKA_SERVICE, KAFKA_TOPICS} from "@app/kafka";
import {ClientKafka} from "@nestjs/microservices";
import {TicketsServiceRepository} from "./tickets-service.repository";
import {
    CheckedInTicketRequestDto,
    EventTicketResponseDto,
    PaginationQueryDto,
    PurchaseTicketRequestDto,
    TicketCancelledEvent,
    TicketPurchasedEvent,
    TicketResponseDto
} from "@app/contracts";
import {EventsServiceRepository} from "../../events-service/src/events-service.repository";
import {Event, EventStatus, Ticket, TicketStatus} from "@prisma/client";
import {generateCodes} from "@app/common";
import {TicketsServiceMapper} from "./tickets-service.mapper";

@Injectable()
export class TicketsServiceService implements OnModuleInit {

    constructor(
        @Inject(KAFKA_SERVICE) private readonly kafkaClient: ClientKafka,
        private readonly ticketsRepository: TicketsServiceRepository,
        private readonly eventsRepository: EventsServiceRepository,
    ) {
    }

    async onModuleInit() {
        await this.kafkaClient.connect();
    }

    async purchaseTicket(
        purchaseTicketRequest: PurchaseTicketRequestDto,
        userId: string
    ): Promise<TicketResponseDto> {
        const {eventId, quantity} = purchaseTicketRequest;

        const savedEvent = await this.eventsRepository.findEventById(eventId);
        if (!savedEvent) {
            throw new NotFoundException(`Event with id ${eventId} not found`);
        }

        if (savedEvent.status !== EventStatus.PUBLISHED) {
            throw new BadRequestException('Event is not published yet');
        }

        if ((savedEvent.date.getTime() + (60 * 60 * 1000)) < new Date().getTime()) {
            throw new BadRequestException('No longer available to purchase tickets for this event as it has passed');
        }

        const soldTickets: number = await this.ticketsRepository.countSoldTickets(eventId);
        const remainingTickets: number = savedEvent.capacity - soldTickets;

        if (quantity > remainingTickets) {
            throw new BadRequestException(`Only ${remainingTickets} tickets are available for this event`);
        }

        const ticket = {
            eventId,
            userId,
            quantity,
            totalPrice: savedEvent.price * quantity,
            ticketCode: generateCodes(),
            status: TicketStatus.CONFIRMED,
        } as Ticket;

        const createdTicket = await this.ticketsRepository.createTicket(ticket);

        const ticketPurchasedEvent: TicketPurchasedEvent = {
            ticketId: createdTicket.id,
            ticketCode: createdTicket.ticketCode,
            email: createdTicket.user.email,
            name: createdTicket.user.name,
            eventTitle: savedEvent.title,
            eventDate: savedEvent.date,
            eventLocation: savedEvent.location,
            quantity: createdTicket.quantity,
            totalPrice: createdTicket.totalPrice,
        };
        this.kafkaClient.emit(KAFKA_TOPICS.TICKET_PURCHASED, ticketPurchasedEvent);

        return TicketsServiceMapper.toTicketResponseDto(createdTicket, savedEvent);
    }

    async findMyTickets(
        paginationQuery: PaginationQueryDto,
        userId: string
    ): Promise<{ tickets: TicketResponseDto[], totalElements: number }> {
        const {size, page} = paginationQuery;
        const skip: number = (page - 1) * size;

        const {tickets, totalElements} = await this.ticketsRepository
            .findAllTickets({userId}, size, skip);

        return {
            tickets: tickets.map(ticket =>
                TicketsServiceMapper.toTicketResponseDto(ticket, ticket.event as Event)
            ),
            totalElements,
        };
    }

    async findEventTickets(
        eventId: string,
        organizerId: string,
        paginationQuery: PaginationQueryDto
    ): Promise<{ tickets: EventTicketResponseDto[], totalElements: number }> {
        const {size, page} = paginationQuery;
        const skip: number = (page - 1) * size;

        const savedEvent = await this.eventsRepository.findEventById(eventId);
        if (!savedEvent) {
            throw new NotFoundException(`Event with id ${eventId} not found`);
        }

        if (savedEvent.organizerId !== organizerId) {
            throw new ForbiddenException('You are not authorized to view this event\'s tickets');
        }

        const {tickets, totalElements} = await this.ticketsRepository
            .findEventTickets(eventId, size, skip);

        return {
            tickets: tickets.map(TicketsServiceMapper.toEventTicketResponseDto),
            totalElements,
        };
    }

    async findTicketById(ticketId: string): Promise<TicketResponseDto> {
        const savedTicket = (await this.ticketsRepository.findTicketById(ticketId))!;
        if (!savedTicket) {
            throw new NotFoundException(`Ticket with id ${ticketId} not found`);
        }

        return TicketsServiceMapper.toTicketResponseDto(savedTicket, savedTicket.event as Event);
    }

    async cancelTicket(ticketId: string): Promise<null> {
        const savedTicket = (await this.ticketsRepository.findTicketById(ticketId))!;

        if (savedTicket.status === TicketStatus.CANCELLED || savedTicket.status === TicketStatus.CHECKED_IN) {
            throw new BadRequestException(`Ticket is already ${savedTicket.status.toLowerCase()}`);
        }

        const cancelledTicket = await this.ticketsRepository
            .updateTicket(ticketId, {status: TicketStatus.CANCELLED} as Ticket);

        const ticketCancelledEvent: TicketCancelledEvent = {
            ticketId: cancelledTicket.id,
            email: cancelledTicket.user.email,
            name: cancelledTicket.user.name,
            eventTitle: cancelledTicket.event.title,
        };
        this.kafkaClient.emit(KAFKA_TOPICS.TICKET_CANCELLED, ticketCancelledEvent);

        return null;
    }

    async checkInTicket(
        checkedInTicketRequest: CheckedInTicketRequestDto,
        organizerId: string
    ): Promise<null> {
        const {ticketCode} = checkedInTicketRequest;

        const savedTicket = await this.ticketsRepository.findTicketByCode(ticketCode);
        if (!savedTicket) {
            throw new NotFoundException(`Ticket with code ${ticketCode} not found`);
        }

        if (savedTicket.event.organizerId !== organizerId) {
            throw new ForbiddenException('You are not authorized to check in this ticket');
        }

        if (savedTicket.status === TicketStatus.CANCELLED || savedTicket.status === TicketStatus.CHECKED_IN) {
            throw new BadRequestException(`Ticket is already ${savedTicket.status.toLowerCase()}`);
        }

        const checkedInTicket = await this.ticketsRepository
            .updateTicket(savedTicket.id, {
                status: TicketStatus.CHECKED_IN,
                checkedInAt: new Date(),
            } as Ticket);

        this.kafkaClient.emit(KAFKA_TOPICS.TICKET_CHECKED_IN, {
            ticketId: checkedInTicket.id,
            eventId: checkedInTicket.eventId,
            ticketCode: ticketCode,
            timestamp: new Date().toISOString(),
        });

        return null;
    }
    
}
