import {Injectable} from '@nestjs/common';
import {constructPagination, handleServiceError, HttpStatusText, SERVICES_PORTS} from "@app/common";
import {HttpService} from "@nestjs/axios";
import {firstValueFrom} from "rxjs";
import {
    AppResponseDto,
    CreateEventRequestDto,
    CurrentUserDto,
    PaginationQueryDto,
    UpdateEventRequestDto
} from "@app/contracts";
import {EventResponseDto} from "@app/contracts/events/dto/event-response.dto";

@Injectable()
export class EventsService {

    private readonly EVENTS_SERVICE_URL: string =
        `http://localhost:${SERVICES_PORTS.EVENTS_SERVICE}/events`;

    constructor(
        private readonly httpService: HttpService,
    ) {
    }

    async createEvent(
        createEventRequest: CreateEventRequestDto,
        currentUser: CurrentUserDto
    ): Promise<AppResponseDto<EventResponseDto>> {
        try {
            const {data} = await firstValueFrom(
                this.httpService.post<EventResponseDto>(
                    `${this.EVENTS_SERVICE_URL}`,
                    createEventRequest,
                    {
                        headers: {
                            'x-user-id': currentUser.id
                        }
                    }
                )
            );

            return {
                status: HttpStatusText.SUCCESS,
                message: 'Event created successfully',
                data: data,
            }
        } catch (err) {
            handleServiceError(err);
        }
    }

    async findAllEvents(paginationQuery: PaginationQueryDto): Promise<AppResponseDto<EventResponseDto[]>> {
        try {
            const {data} = await firstValueFrom(
                this.httpService.get<{ events: EventResponseDto[], totalElements: number }>(
                    `${this.EVENTS_SERVICE_URL}`,
                    {
                        params: paginationQuery,
                    }
                )
            );

            return {
                status: HttpStatusText.SUCCESS,
                data: data.events,
                pagination: constructPagination(data.totalElements, paginationQuery.page, paginationQuery.size),
            };
        } catch (err) {
            handleServiceError(err);
        }
    }

    async findEventById(id: string): Promise<AppResponseDto<EventResponseDto>> {
        try {
            const {data} = await firstValueFrom(
                this.httpService.get<EventResponseDto>(
                    `${this.EVENTS_SERVICE_URL}/${id}`
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

    async findMyEvents(
        paginationQuery: PaginationQueryDto,
        currentUser: CurrentUserDto
    ): Promise<AppResponseDto<EventResponseDto[]>> {
        try {
            const {data} = await firstValueFrom(
                this.httpService.get<{ events: EventResponseDto[], totalElements: number }>(
                    `${this.EVENTS_SERVICE_URL}/me`,
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
                data: data.events,
                pagination: constructPagination(data.totalElements, paginationQuery.page, paginationQuery.size),
            };
        } catch (err) {
            handleServiceError(err);
        }
    }

    async updateEvent(
        id: string,
        updateEventRequest: UpdateEventRequestDto,
        currentUser: CurrentUserDto
    ): Promise<AppResponseDto<EventResponseDto>> {
        try {
            const {data} = await firstValueFrom(
                this.httpService.patch<EventResponseDto>(
                    `${this.EVENTS_SERVICE_URL}/${id}`,
                    updateEventRequest,
                    {
                        headers: {
                            'x-user-id': currentUser.id
                        }
                    }
                )
            );

            const updatedFields = Object.keys(updateEventRequest).join(', ');

            return {
                status: HttpStatusText.SUCCESS,
                message: `${updatedFields} updated successfully`,
                data: data,
            };
        } catch (err) {
            handleServiceError(err);
        }
    }

    async publishEvent(id: string, currentUser: CurrentUserDto): Promise<AppResponseDto<EventResponseDto>> {
        try {
            const {data} = await firstValueFrom(
                this.httpService.patch<EventResponseDto>(
                    `${this.EVENTS_SERVICE_URL}/${id}/publish-event`,
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
                message: 'Event published successfully',
                data: data,
            };
        } catch (err) {
            handleServiceError(err);
        }
    }

    async cancelEvent(id: string, currentUser: CurrentUserDto): Promise<AppResponseDto<EventResponseDto>> {
        try {
            const {data} = await firstValueFrom(
                this.httpService.patch<EventResponseDto>(
                    `${this.EVENTS_SERVICE_URL}/${id}/cancel-event`,
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
                message: 'Event cancelled successfully',
                data: data,
            };
        } catch (err) {
            handleServiceError(err);
        }
    }

}
