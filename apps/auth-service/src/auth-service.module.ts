import {Module, ValidationPipe} from '@nestjs/common';
import {AuthServiceController} from './auth-service.controller';
import {AuthServiceService} from './auth-service.service';
import {KafkaModule} from "@app/kafka";
import {JwtModule} from "@nestjs/jwt";
import {ConfigModule, ConfigService} from "@nestjs/config";
import {AllExceptionsFilter, JWT_CONFIG, ValidationException} from "@app/common";
import {AuthServiceRepository} from "./auth-service.repository";
import {PrismaModule} from "@app/database";
import {JwtStrategy} from "./jwt.strategy";
import {AdminService} from "./admin/admin.service";
import {AdminController} from "./admin/admin.controller";
import {ValidationError} from "class-validator";
import {APP_FILTER, APP_PIPE} from "@nestjs/core";

@Module({
    imports: [
        PrismaModule,
        ConfigModule.forRoot({
            isGlobal: true,
        }),
        JwtModule.registerAsync({
            global: true,
            useFactory: (configService: ConfigService) => ({
                secret: configService.getOrThrow(JWT_CONFIG.ACCESS_TOKEN_SECRET),
                signOptions: {
                    expiresIn: `${configService.getOrThrow(JWT_CONFIG.ACCESS_TOKEN_EXPIRATION)}ms`
                },
            }),
            inject: [ConfigService]
        }),
        KafkaModule.register('auth-service-group'),
    ],
    controllers: [AuthServiceController, AdminController],
    providers: [
        AuthServiceRepository,
        AuthServiceService,
        AdminService,
        JwtStrategy,
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
export class AuthServiceModule {
}
