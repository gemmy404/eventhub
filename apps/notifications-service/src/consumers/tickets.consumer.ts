import {Controller, Logger} from '@nestjs/common';
import {EventPattern, Payload} from '@nestjs/microservices';
import {TicketCancelledEvent, TicketPurchasedEvent,} from '@app/contracts';
import {MailService} from '../mail/mail.service';
import {KAFKA_TOPICS} from "@app/kafka";

@Controller()
export class TicketsConsumer {

    private readonly logger = new Logger(TicketsConsumer.name);

    constructor(
        private readonly mailService: MailService,
    ) {
    }

    @EventPattern(KAFKA_TOPICS.TICKET_PURCHASED)
    async handleTicketPurchased(@Payload() ticketPurchasedEvent: TicketPurchasedEvent): Promise<void> {
        this.logger.log(`Received TICKET_PURCHASED event for ${ticketPurchasedEvent.email}`);

        await this.mailService.sendTicketPurchasedEmail(ticketPurchasedEvent);
    }

    @EventPattern(KAFKA_TOPICS.TICKET_CANCELLED)
    async handleTicketCancelled(@Payload() ticketCancelledEvent: TicketCancelledEvent): Promise<void> {
        this.logger.log(`Received TICKET_CANCELLED event for ${ticketCancelledEvent.email}`);

        await this.mailService.sendTicketCancelledEmail(ticketCancelledEvent);
    }
}