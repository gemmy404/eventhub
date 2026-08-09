import {Module, ValidationPipe} from '@nestjs/common';
import {TicketsServiceController} from './tickets-service.controller';
import {TicketsServiceService} from './tickets-service.service';
import {KafkaModule} from "@app/kafka";
import {ConfigModule} from "@nestjs/config";
import {PrismaModule} from "@app/database";
import {TicketsServiceRepository} from "./tickets-service.repository";
import {APP_PIPE} from "@nestjs/core";
import {IsTicketOwnerGuard} from "./is-ticket-owner.guard";

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
            }),
        },
    ],
})
export class TicketsServiceModule {
}
