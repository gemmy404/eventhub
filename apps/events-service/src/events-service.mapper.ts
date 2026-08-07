import {Event, Prisma} from "@prisma/client";
import {EventResponseDto} from "@app/contracts/events/dto/event-response.dto";

type EventWithOrganizer = Prisma.EventGetPayload<{
    include: {
        organizer: {
            select: {
                name: true
            }
        }
    }
}>;

export class EventsServiceMapper {

    private constructor() {
    }

    static toEventResponseDto(event: Event): EventResponseDto {
        return {
            id: event.id,
            title: event.title,
            description: event.description || null,
            date: event.date,
            location: event.location,
            capacity: event.capacity,
            price: event.price,
            status: event.status,
        };
    }

    static toEventWithOrganizerResponseDto(event: EventWithOrganizer): EventResponseDto {
        return {
            id: event.id,
            title: event.title,
            description: event.description || null,
            date: event.date,
            location: event.location,
            capacity: event.capacity,
            price: event.price,
            status: event.status,
            organizerName: event.organizer.name,
        };
    }
}
