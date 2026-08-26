import {Module, ValidationPipe} from '@nestjs/common';
import {TicketsServiceController} from './tickets-service.controller';
import {TicketsServiceService} from './tickets-service.service';
import {KafkaModule} from "@app/kafka";
import {ConfigModule} from "@nestjs/config";
import {PrismaModule} from "@app/database";
import {TicketsServiceRepository} from "./tickets-service.repository";
import {APP_FILTER, APP_PIPE} from "@nestjs/core";
import {IsTicketOwnerGuard} from "./is-ticket-owner.guard";
import {ValidationError} from "class-validator";
import {AllExceptionsFilter, ValidationException} from "@app/common";

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
        }),
        PrismaModule,
        KafkaModule.register('tickets-service-group'),
    ],
    controllers: [TicketsServiceController],
    providers: [
        TicketsServiceRepository,
        TicketsServiceService,
        IsTicketOwnerGuard,
        {
            provide: APP_PIPE,
            useValue: new ValidationPipe({
                whitelist: true,
                forbidNonWhitelisted: true,
                transform: true,
                exceptionFactory: (errors: ValidationError[]) => {
                    const extractErrors = (errorList: ValidationError[]) => {
                        return errorList.flatMap((err: ValidationError) => {
                            const constraints: string[] = err.constraints ? Object.values(err.constraints) : [];
                            const childErrors: string[] = err.children ? extractErrors(err.children) : [];
                            return [...constraints, ...childErrors];
                        });
                    };
                    const messages: string[] = extractErrors(errors);

                    return new ValidationException(messages, 400);
                },
            }),
        },
        {
            provide: APP_FILTER,
            useClass: AllExceptionsFilter,
        },
    ],
})
export class TicketsServiceModule {
}
