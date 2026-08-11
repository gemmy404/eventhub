import {Injectable} from '@nestjs/common';
import {constructPagination, handleServiceError, HttpStatusText, SERVICES_PORTS} from "@app/common";
import {HttpService} from "@nestjs/axios";
import {
    AppResponseDto,
    CheckedInTicketRequestDto,
    CurrentUserDto,
    EventTicketResponseDto,
    PaginationQueryDto,
    PurchaseTicketRequestDto,
    TicketResponseDto
} from "@app/contracts";
import {firstValueFrom} from "rxjs";

@Injectable()
export class TicketsService {

    private readonly TICKETS_SERVICE_URL: string =
        `http://localhost:${SERVICES_PORTS.TICKETS_SERVICE}/tickets`;

    constructor(
        private readonly httpService: HttpService,
    ) {
    }

    async purchaseTicket(
        purchaseTicketRequest: PurchaseTicketRequestDto,
        currentUser: CurrentUserDto
    ): Promise<AppResponseDto<TicketResponseDto>> {
        try {
            const {data} = await firstValueFrom(
                this.httpService.post<TicketResponseDto>(
                    `${this.TICKETS_SERVICE_URL}/purchase-ticket`,
                    purchaseTicketRequest,
                    {
                        headers: {
                            'x-user-id': currentUser.id
                        },
                    }
                )
            );

            return {
                status: HttpStatusText.SUCCESS,
                message: 'Ticket purchased successfully',
                data: data,
            };
        } catch (err) {
            handleServiceError(err);
        }
    }

    async findMyTickets(
        paginationQuery: PaginationQueryDto,
        currentUser: CurrentUserDto
    ): Promise<AppResponseDto<TicketResponseDto[]>> {
        try {
            const {data} = await firstValueFrom(
                this.httpService.get<{ tickets: TicketResponseDto[], totalElements: number }>(
                    `${this.TICKETS_SERVICE_URL}/me`,
                    {
                        params: paginationQuery,
                        headers: {
                            'x-user-id': currentUser.id
                        }
                    }
                )
            );

            return {
                status: HttpStatusText.SUCCESS,
                data: data.tickets,
                pagination: constructPagination(data.totalElements, paginationQuery.page, paginationQuery.size),
            };
        } catch (err) {
            handleServiceError(err);
        }
    }

    async findEventTickets(
        eventId: string,
        currentUser: CurrentUserDto,
        paginationQuery: PaginationQueryDto
    ): Promise<AppResponseDto<EventTicketResponseDto[]>> {
        try {
            const {data} = await firstValueFrom(
                this.httpService.get<{ tickets: EventTicketResponseDto[], totalElements: number }>(
                    `${this.TICKETS_SERVICE_URL}/events/${eventId}`,
                    {
                        params: paginationQuery,
                        headers: {
                            'x-user-id': currentUser.id
                        }
                    }
                )
            );

            return {
                status: HttpStatusText.SUCCESS,
                data: data.tickets,
                pagination: constructPagination(data.totalElements, paginationQuery.page, paginationQuery.size),
            };
        } catch (err) {
            handleServiceError(err);
        }
    }

    async findTicketById(
        ticketId: string,
        currentUser: CurrentUserDto
    ): Promise<AppResponseDto<TicketResponseDto>> {
        try {
            const {data} = await firstValueFrom(
                this.httpService.get<TicketResponseDto>(
                    `${this.TICKETS_SERVICE_URL}/${ticketId}`,
                    {
                        headers: {
                            'x-user-id': currentUser.id
                        }
                    }
                )
            );

            return {
                status: HttpStatusText.SUCCESS,
                data: data,
            };
        } catch (err) {
            handleServiceError(err);
        }
    }

    async cancelTicket(
        ticketId: string,
        currentUser: CurrentUserDto
    ): Promise<AppResponseDto<null>> {
        try {
            await firstValueFrom(
                this.httpService.patch<null>(
                    `${this.TICKETS_SERVICE_URL}/${ticketId}/cancel-ticket`,
                    {},
                    {
                        headers: {
                            'x-user-id': currentUser.id
                        }
                    }
                )
            );

            return {
                status: HttpStatusText.SUCCESS,
                message: 'Ticket cancelled successfully',
                data: null,
            };
        } catch (err) {
            handleServiceError(err);
        }
    }

    async checkInTicket(
        checkedInTicketRequest: CheckedInTicketRequestDto,
        currentUser: CurrentUserDto
    ): Promise<AppResponseDto<null>> {
        try {
            await firstValueFrom(
                this.httpService.patch<null>(
                    `${this.TICKETS_SERVICE_URL}/check-in-ticket`,
                    checkedInTicketRequest,
                    {
                        headers: {
                            'x-user-id': currentUser.id
                        }
                    }
                )
            );

            return {
                status: HttpStatusText.SUCCESS,
                message: 'Ticket checked in successfully',
                data: null,
            };
        } catch (err) {
            handleServiceError(err);
        }
    }
}
