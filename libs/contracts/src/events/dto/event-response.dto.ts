import {EventStatus} from "@prisma/client";

export class EventResponseDto {
    id: string;

    title: string;

    description: string | null;

    date: Date;

    location: string;

    capacity: number;

    price: number;

    status: EventStatus;

    organizerName?: string;
}