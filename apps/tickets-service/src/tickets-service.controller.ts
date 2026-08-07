import {Body, Controller, Get, Headers, Param, Patch, Post, Query, UseGuards} from '@nestjs/common';
import {TicketsServiceService} from './tickets-service.service';
import {
    CheckedInTicketRequestDto,
    EventTicketResponseDto,
    PaginationQueryDto,
    PurchaseTicketRequestDto,
    TicketResponseDto
} from "@app/contracts";
import {IsTicketOwnerGuard} from "./is-ticket-owner.guard";

@Controller('tickets')
export class TicketsServiceController {

    constructor(private readonly ticketsServiceService: TicketsServiceService) {
    }

    @Post('purchase-ticket')
    purchaseTicket(
        @Body() purchaseTicketRequest: PurchaseTicketRequestDto,
        @Headers('x-user-id') userId: string
    ): Promise<TicketResponseDto> {
        return this.ticketsServiceService.purchaseTicket(purchaseTicketRequest, userId);
    }

    @Get('me')
    findMyTickets(
        @Query() paginationQuery: PaginationQueryDto,
        @Headers('x-user-id') userId: string
    ): Promise<{ tickets: TicketResponseDto[], totalElements: number }> {
        return this.ticketsServiceService.findMyTickets(paginationQuery, userId);
    }

    @Get('events/:eventId')
    findEventTickets(
        @Param('eventId') eventId: string,
        @Headers('x-user-id') organizerId: string,
        @Query() paginationQuery: PaginationQueryDto
    ): Promise<{ tickets: EventTicketResponseDto[], totalElements: number }> {
        return this.ticketsServiceService.findEventTickets(eventId, organizerId, paginationQuery);
    }

    @Get(':ticketId')
    @UseGuards(IsTicketOwnerGuard)
    findTicketById(@Param('ticketId') ticketId: string): Promise<TicketResponseDto> {
        return this.ticketsServiceService.findTicketById(ticketId);
    }

    @Patch(':ticketId/cancel-ticket')
    @UseGuards(IsTicketOwnerGuard)
    cancelTicket(@Param('ticketId') ticketId: string): Promise<null> {
        return this.ticketsServiceService.cancelTicket(ticketId);
    }

    @Patch('check-in-ticket')
    checkInTicket(
        @Body() checkedInTicketRequest: CheckedInTicketRequestDto,
        @Headers('x-user-id') organizerId: string
    ): Promise<null> {
        return this.ticketsServiceService.checkInTicket(checkedInTicketRequest, organizerId);
    }

}
