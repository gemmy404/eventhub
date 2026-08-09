import {EventResponseDto} from "@app/contracts/events";

export class GetEventForTicketsResponseDto extends EventResponseDto{
    organizerId: string;
}