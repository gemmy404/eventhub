import {NestFactory} from '@nestjs/core';
import {NotificationsServiceModule} from './notifications-service.module';
import {Logger} from "@nestjs/common";
import {SERVICES_PORTS} from "@app/common";
import {MicroserviceOptions, Transport} from "@nestjs/microservices";
import {KAFKA_BROKER, KAFKA_CLIENT_ID} from "@app/kafka";

const logger = new Logger('NotificationsService');

async function bootstrap() {
    const app = await NestFactory.create(NotificationsServiceModule);

    app.connectMicroservice<MicroserviceOptions>({
        transport: Transport.KAFKA,
        options: {
            client: {
                clientId: `${KAFKA_CLIENT_ID}-notifications`,
                brokers: [KAFKA_BROKER],
            },
            consumer: {
                groupId: 'notifications-consumer-group',
            },
        },
    });

    await app.startAllMicroservices();

    await app.listen(SERVICES_PORTS.NOTIFICATIONS_SERVICE);
    logger.log(`Notifications service is running on port ${SERVICES_PORTS.NOTIFICATIONS_SERVICE}`);
    logger.log(`Kafka broker: ${KAFKA_BROKER}`);
}

bootstrap();
