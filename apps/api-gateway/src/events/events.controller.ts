import {Body, Controller, Get, Param, Patch, Post, Query, UseGuards} from '@nestjs/common';
import {EventsService} from './events.service';
import {
    AppResponseDto,
    CreateEventRequestDto,
    CurrentUserDto,
    PaginationQueryDto,
    UpdateEventRequestDto, UserRoles
} from "@app/contracts";
import {CurrentUser, Roles} from "@app/common";
import {JwtAuthGuard} from "../../../auth-service/src/jwt-auth.guard";
import {EventResponseDto} from "@app/contracts/events/dto/event-response.dto";
import {RolesGuard} from "../../../auth-service/src/roles.guard";

@Controller('api/v1/events')
export class EventsController {

    constructor(private readonly eventsService: EventsService) {
    }

    @Post()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRoles.ORGANIZER)
    createEvent(
        @Body() createEventRequest: CreateEventRequestDto,
        @CurrentUser() currentUser: CurrentUserDto
    ): Promise<AppResponseDto<EventResponseDto>> {
        return this.eventsService.createEvent(createEventRequest, currentUser);
    }

    @Get()
    findAllEvents(
        @Query() paginationQuery: PaginationQueryDto
    ): Promise<AppResponseDto<EventResponseDto[]>> {
        return this.eventsService.findAllEvents(paginationQuery);
    }

    @Get('me')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRoles.ORGANIZER)
    findMyEvents(
        @Query() paginationQuery: PaginationQueryDto,
        @CurrentUser() currentUser: CurrentUserDto
    ): Promise<AppResponseDto<EventResponseDto[]>> {
        return this.eventsService.findMyEvents(paginationQuery, currentUser);
    }

    @Get(':eventId')
    findEventById(@Param('eventId') eventId: string): Promise<AppResponseDto<EventResponseDto>> {
        return this.eventsService.findEventById(eventId);
    }

    @Patch(':eventId/publish-event')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRoles.ORGANIZER)
    publishEvent(
        @Param('eventId') eventId: string,
        @CurrentUser() currentUser: CurrentUserDto
    ): Promise<AppResponseDto<EventResponseDto>> {
        return this.eventsService.publishEvent(eventId, currentUser);
    }

    @Patch(':eventId/cancel-event')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRoles.ORGANIZER)
    cancelEvent(
        @Param('eventId') eventId: string,
        @CurrentUser() currentUser: CurrentUserDto
    ): Promise<AppResponseDto<EventResponseDto>> {
        return this.eventsService.cancelEvent(eventId, currentUser);
    }

    @Patch(':eventId')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRoles.ORGANIZER)
    updateEvent(
        @Param('eventId') eventId: string,
        @Body() updateEventRequest: UpdateEventRequestDto,
        @CurrentUser() currentUser: CurrentUserDto
    ): Promise<AppResponseDto<EventResponseDto>> {
        return this.eventsService.updateEvent(eventId, updateEventRequest, currentUser);
    }

}
