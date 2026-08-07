import {Controller, Logger} from "@nestjs/common";
import {EventPattern, Payload} from "@nestjs/microservices";
import {UserRegisteredEvent} from "@app/contracts";
import {MailService} from "../mail/mail.service";
import {KAFKA_TOPICS} from "@app/kafka";

@Controller()
export class AuthConsumer {

    private readonly logger = new Logger(AuthConsumer.name);

    constructor(
        private readonly mailService: MailService,
    ) {
    }

    @EventPattern(KAFKA_TOPICS.USER_REGISTERED)
    async handleUserRegistered(@Payload() userRegisteredEvent: UserRegisteredEvent): Promise<void> {
        this.logger.log(`Received USER_REGISTERED event for ${userRegisteredEvent.email}`);

        await this.mailService.sendWelcomeEmail(userRegisteredEvent);
    }

}