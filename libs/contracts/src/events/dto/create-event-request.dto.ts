import {EventStatus} from "@prisma/client";
import {IsDateString, IsEnum, IsInt, IsNotEmpty, IsOptional, MaxLength, Min} from "class-validator";

export class CreateEventRequestDto {
    @IsNotEmpty({message: 'Title is required'})
    @MaxLength(255, {message: 'Title must be not exceed 255 characters'})
    title: string;

    @IsOptional()
    description?: string;

    @IsNotEmpty({message: 'Date is required'})
    @IsDateString({}, {message: 'Date must be a valid date string'})
    date: string;

    @IsNotEmpty({message: 'Location is required'})
    @MaxLength(255, {message: 'Location must be not exceed 255 characters'})
    location: string;

    @IsNotEmpty({message: 'Capacity is required'})
    @IsInt({message: 'Capacity must be an integer'})
    @Min(1, {message: 'Capacity must be at least 1'})
    capacity: number;

    @IsOptional()
    @IsInt({message: 'Capacity must be a integer'})
    @Min(0, {message: 'Price must be at least 0'})
    price: number = 0;

    @IsNotEmpty({message: 'Status is required'})
    @IsEnum(EventStatus,
        {
            message: `Status must be one of the following values: ${Object.values(EventStatus).join(', ')}`
        })
    status: EventStatus;
}