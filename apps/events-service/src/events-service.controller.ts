import {Body, Controller, Get, Headers, Param, Patch, Post, Query} from '@nestjs/common';
import {EventsServiceService} from './events-service.service';
import {
    CreateEventRequestDto,
    FindEventByIdPayloadDto, GetEventForTicketsResponseDto,
    PaginationQueryDto,
    UpdateEventRequestDto
} from "@app/contracts";
import {EventResponseDto} from "@app/contracts/events/dto/event-response.dto";
import {MessagePattern, Payload} from "@nestjs/microservices";
import {EVENT_PATTERNS} from "@app/kafka";

@Controller('events')
export class EventsServiceController {
    constructor(private readonly eventsServiceService: EventsServiceService) {
    }

    //------------------------------- REST -----------------------------------

    @Post()
    createEvent(
        @Body() createEventRequest: CreateEventRequestDto,
        @Headers('x-user-id') userId: string,
    ): Promise<EventResponseDto> {
        return this.eventsServiceService.createEvent(createEventRequest, userId);
    }

    @Get()
    findAllEvents(
        @Query() paginationQuery: PaginationQueryDto
    ): Promise<{ events: EventResponseDto[], totalElements: number }> {
        return this.eventsServiceService.findAllEvents(paginationQuery);
    }

    @Get('me')
    findMyEvents(
        @Query() paginationQuery: PaginationQueryDto,
        @Headers('x-user-id') userId: string,
    ): Promise<{ events: EventResponseDto[], totalElements: number }> {
        return this.eventsServiceService.findMyEvents(paginationQuery, userId);
    }

    @Get(':eventId')
    findEventById(@Param('eventId') eventId: string): Promise<EventResponseDto> {
        return this.eventsServiceService.findEventById(eventId);
    }

    @Patch(':eventId/publish-event')
    publishEvent(
        @Param('eventId') eventId: string,
        @Headers('x-user-id') userId: string,
    ): Promise<EventResponseDto> {
        return this.eventsServiceService.publishEvent(eventId, userId);
    }

    @Patch(':eventId/cancel-event')
    cancelEvent(
        @Param('eventId') eventId: string,
        @Headers('x-user-id') userId: string,
    ): Promise<EventResponseDto> {
        return this.eventsServiceService.cancelEvent(eventId, userId);
    }

    @Patch(':eventId')
    updateEvent(
        @Param('eventId') eventId: string,
        @Body() updateEventRequest: UpdateEventRequestDto,
        @Headers('x-user-id') userId: string,
    ): Promise<EventResponseDto> {
        return this.eventsServiceService.updateEvent(eventId, updateEventRequest, userId);
    }

    //------------------------------- Kafka -----------------------------------

    @MessagePattern(EVENT_PATTERNS.GET_EVENT_FOR_TICKETS)
    async findEventByIdByKafka(
        @Payload() payload: FindEventByIdPayloadDto,
    ): Promise<GetEventForTicketsResponseDto | EventResponseDto> {
        return this.eventsServiceService.findEventById(payload.eventId);
    }

}
