import {Module, ValidationPipe} from '@nestjs/common';
import {EventsServiceController} from './events-service.controller';
import {EventsServiceService} from './events-service.service';
import {PrismaModule} from "@app/database";
import {KafkaModule} from "@app/kafka";
import {EventsServiceRepository} from "./events-service.repository";
import {ConfigModule} from "@nestjs/config";
import {APP_FILTER, APP_PIPE} from "@nestjs/core";
import {ValidationError} from "class-validator";
import {AllExceptionsFilter, ValidationException} from "@app/common";

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
        }),
        PrismaModule,
        KafkaModule.register('events-service-group'),
    ],
    controllers: [EventsServiceController],
    providers: [
        EventsServiceRepository,
        EventsServiceService,
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
    exports: [EventsServiceRepository]
})
export class EventsServiceModule {
}
