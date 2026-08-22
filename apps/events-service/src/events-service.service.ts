import {
    ConflictException,
    ForbiddenException,
    Inject,
    Injectable,
    NotFoundException,
    OnModuleInit
} from '@nestjs/common';
import {KAFKA_SERVICE, KAFKA_TOPICS} from "@app/kafka";
import {ClientKafka} from "@nestjs/microservices";
import {EventsServiceRepository} from "./events-service.repository";
import {
    CreateEventRequestDto,
    EventResponseDto,
    GetEventForTicketsResponseDto,
    PaginationQueryDto,
    UpdateEventRequestDto
} from "@app/contracts";
import {Event, EventStatus} from "@prisma/client";
import {EventsServiceMapper} from "./events-service.mapper";

@Injectable()
export class EventsServiceService implements OnModuleInit {

    constructor(
        @Inject(KAFKA_SERVICE) private readonly kafkaClient: ClientKafka,
        private readonly eventsRepository: EventsServiceRepository,
    ) {
    }

    async onModuleInit() {
        await this.kafkaClient.connect();
    }

    async createEvent(createEventRequest: CreateEventRequestDto, userId: string): Promise<EventResponseDto> {
        const createdEvent = await this.eventsRepository.createEvent({
            ...createEventRequest
            ,date: new Date(createEventRequest.date),
            organizerId: userId,
        } as Event);

        this.kafkaClient.emit(KAFKA_TOPICS.EVENT_CREATED, {
            eventId: createdEvent.id,
            organizerId: createdEvent.organizerId,
            title: createdEvent.title,
            timestamp: new Date().toISOString(),
        });

        return EventsServiceMapper.toEventResponseDto(createdEvent);
    }

    async findAllEvents(paginationQuery: PaginationQueryDto): Promise<{
        events: EventResponseDto[],
        totalElements: number
    }> {
        const {size, page} = paginationQuery;

        const skip: number = (page - 1) * size;
        const {
            events,
            totalElements
        } = await this.eventsRepository.findAllEvents({status: EventStatus.PUBLISHED}, size, skip);

        return {
            events: events.map(EventsServiceMapper.toEventWithOrganizerResponseDto),
            totalElements,
        };
    }

    async findEventById(id: string): Promise<EventResponseDto | GetEventForTicketsResponseDto> {
        const savedEvent: Event | null = await this.eventsRepository.findEventById(id);
        if (!savedEvent) {
            throw new NotFoundException(`Event with id ${id} not found`);
        }

        return {...EventsServiceMapper.toEventResponseDto(savedEvent), organizerId: savedEvent.organizerId};
    }

    private async findEventEntityById(id: string): Promise<Event> {
        const savedEvent: Event | null = await this.eventsRepository.findEventById(id);
        if (!savedEvent) {
            throw new NotFoundException(`Event with id ${id} not found`);
        }

        return savedEvent;
    }

    async updateEvent(
        id: string,
        updateEventRequest: UpdateEventRequestDto,
        userId: string
    ): Promise<EventResponseDto> {
        const savedEvent: Event = await this.findEventEntityById(id);

        if (savedEvent.organizerId !== userId) {
            throw new ForbiddenException('You are not authorized to update this event');
        }

        const date = updateEventRequest.date ? new Date(updateEventRequest.date) : savedEvent.date

        const updatedData = await this.eventsRepository.updateEvent(
            id,
            {...updateEventRequest, date: date} as Event,
        );

        this.kafkaClient.emit(KAFKA_TOPICS.EVENT_UPDATED, {
            eventId: updatedData.id,
            changes: Object.keys(updateEventRequest),
            timestamp: new Date().toISOString(),
        });

        return EventsServiceMapper.toEventResponseDto(updatedData);
    }

    async findMyEvents(paginationQuery: PaginationQueryDto, userId: string): Promise<{
        events: EventResponseDto[],
        totalElements: number
    }> {
        const {size, page} = paginationQuery;

        const skip = (page - 1) * size;
        const {
            events,
            totalElements
        } = await this.eventsRepository.findAllEvents({organizerId: userId}, size, skip);

        return {
            events: events.map(EventsServiceMapper.toEventResponseDto),
            totalElements,
        };
    }

    async publishEvent(id: string, userId: string): Promise<EventResponseDto> {
        const savedEvent: Event = await this.findEventEntityById(id);
        if (savedEvent.status === EventStatus.PUBLISHED) {
            throw new ConflictException('Event is already published');
        }

        if (savedEvent.organizerId !== userId) {
            throw new ForbiddenException('You are not authorized to publish this event');
        }

        savedEvent.status = EventStatus.PUBLISHED;
        const publishedEvent = await this.eventsRepository.updateEvent(id, savedEvent);

        return EventsServiceMapper.toEventResponseDto(publishedEvent);
    }

    async cancelEvent(id: string, userId: string): Promise<EventResponseDto> {
        const savedEvent: Event = await this.findEventEntityById(id);
        if (savedEvent.status === EventStatus.CANCELLED) {
            throw new ConflictException('Event is already cancelled');
        }

        if (savedEvent.organizerId !== userId) {
            throw new ForbiddenException('You are not authorized to cancel this event');
        }

        savedEvent.status = EventStatus.CANCELLED;
        const cancelledEvent = await this.eventsRepository.updateEvent(id, savedEvent);

        this.kafkaClient.emit(KAFKA_TOPICS.EVENT_CANCELLED, {
            eventId: cancelledEvent.id,
            organizerId: cancelledEvent.organizerId,
            timestamp: new Date().toISOString(),
        });

        return EventsServiceMapper.toEventResponseDto(cancelledEvent);
    }

}
