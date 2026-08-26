import {Module, ValidationPipe} from '@nestjs/common';
import {ConfigModule} from "@nestjs/config";
import {AuthModule} from "./auth/auth.module";
import {EventsModule} from "./events/events.module";
import {APP_FILTER, APP_PIPE} from "@nestjs/core";
import {AuthServiceModule} from "../../auth-service/src/auth-service.module";
import { TicketsModule } from './tickets/tickets.module';
import {ValidationError} from "class-validator";
import {AllExceptionsFilter, ValidationException} from "@app/common";

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
        }),
        AuthModule,
        AuthServiceModule,
        EventsModule,
        TicketsModule,
    ],
    providers: [
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
export class AppModule {
}
