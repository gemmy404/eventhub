import {Module} from '@nestjs/common';
import {MailService} from './mail.service';
import {join} from "path";
import {MAIL_CONFIG} from "@app/common";
import {ConfigService} from "@nestjs/config";
import {MailerModule} from "@nestjs-modules/mailer";
import {HandlebarsAdapter} from "@nestjs-modules/mailer/adapters/handlebars.adapter";

@Module({
    imports: [
        MailerModule.forRootAsync({
            useFactory: (configService: ConfigService) => ({
                transport: {
                    host: configService.getOrThrow<string>(MAIL_CONFIG.MAIL_HOST),
                    port: configService.getOrThrow<number>(MAIL_CONFIG.MAIL_PORT),
                    secure: true,
                    auth: {
                        user: configService.getOrThrow<string>(MAIL_CONFIG.MAIL_USER),
                        pass: configService.getOrThrow<string>(MAIL_CONFIG.MAIL_PASS)
                    },
                },
                template: {
                    dir: join(__dirname, 'templates'),
                    adapter: new HandlebarsAdapter(),
                    options: {
                        strict: true
                    },
                },
            }),
            inject: [ConfigService],
        }),
    ],
    providers: [MailService],
    exports: [MailService],
})
export class MailModule {
}
