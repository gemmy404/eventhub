import {Module} from '@nestjs/common';
import {AuthConsumer} from "./consumers/auth.consumer";
import {TicketsConsumer} from "./consumers/tickets.consumer";
import {MailModule} from "./mail/mail.module";
import {ConfigModule} from "@nestjs/config";

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
        }),
        MailModule,
    ],
    controllers: [
        AuthConsumer,
        TicketsConsumer
    ],
})
export class NotificationsServiceModule {
}
