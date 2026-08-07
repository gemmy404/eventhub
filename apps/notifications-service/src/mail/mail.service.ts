import {Injectable, Logger} from '@nestjs/common';
import {ConfigService} from "@nestjs/config";
import {MailerService} from "@nestjs-modules/mailer";
import {TicketCancelledEvent, TicketPurchasedEvent, UserRegisteredEvent} from "@app/contracts";
import {MAIL_CONFIG, MAIL_SUBJECTS, MAIL_TEMPLATES} from "@app/common";

@Injectable()
export class MailService {

    private readonly logger = new Logger(MailService.name);

    constructor(
        private readonly configService: ConfigService,
        private readonly mailerService: MailerService,
    ) {
    }

    private async sendMail(
        to: string,
        subject: string,
        template: string,
        context: Record<string, any>,
    ): Promise<void> {
        try {
            await this.mailerService.sendMail({
                subject,
                to,
                from: `"EventHub" <${this.configService.getOrThrow<string>(MAIL_CONFIG.MAIL_USER)}>`,
                template,
                context,
            });
        } catch (err) {
            this.logger.error(`Failed to send email to ${to}`, err.stack);
            throw err;
        }
    }

    async sendWelcomeEmail(userRegisteredEvent: UserRegisteredEvent): Promise<void> {
        this.logger.log(`Sending welcome email to ${userRegisteredEvent.email}`);

        const context = {
            name: userRegisteredEvent.name,
        };
        await this.sendMail(
            userRegisteredEvent.email,
            MAIL_SUBJECTS.WELCOME,
            MAIL_TEMPLATES.WELCOME,
            context
        );
    }

    async sendTicketPurchasedEmail(ticketPurchasedEvent: TicketPurchasedEvent): Promise<void> {
        this.logger.log(`Sending ticket purchased email to ${ticketPurchasedEvent.email}`);

        const formattedEventDate: string = new Date(ticketPurchasedEvent.eventDate).toLocaleString('en-US', {
            dateStyle: 'full',
            timeStyle: 'short',
        });
        const context = {
            name: ticketPurchasedEvent.name,
            eventTitle: ticketPurchasedEvent.eventTitle,
            eventDate: formattedEventDate,
            eventLocation: ticketPurchasedEvent.eventLocation,
            quantity: ticketPurchasedEvent.quantity,
            totalPrice: ticketPurchasedEvent.totalPrice,
            ticketCode: ticketPurchasedEvent.ticketCode,
        };
        await this.sendMail(
            ticketPurchasedEvent.email,
            MAIL_SUBJECTS.TICKET_PURCHASED,
            MAIL_TEMPLATES.TICKET_PURCHASED,
            context
        );
    }

    async sendTicketCancelledEmail(ticketCancelledEvent: TicketCancelledEvent): Promise<void> {
        this.logger.log(`Sending ticket cancelled email to ${ticketCancelledEvent.email}`);

        const context = {
            name: ticketCancelledEvent.name,
            eventTitle: ticketCancelledEvent.eventTitle,
            ticketId: ticketCancelledEvent.ticketId,
        };
        await this.sendMail(
            ticketCancelledEvent.email,
            MAIL_SUBJECTS.TICKET_CANCELLED,
            MAIL_TEMPLATES.TICKET_CANCELLED,
            context
        );
    }

}
