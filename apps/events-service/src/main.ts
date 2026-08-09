import {NestFactory} from '@nestjs/core';
import {EventsServiceModule} from './events-service.module';
import {SERVICES_PORTS} from "@app/common";
import {Logger} from "@nestjs/common";
import {MicroserviceOptions, Transport} from "@nestjs/microservices";
import {KAFKA_BROKER, KAFKA_CLIENT_ID} from "@app/kafka";

const logger = new Logger('EventsService');

async function bootstrap() {
    const app = await NestFactory.create(EventsServiceModule);

    app.connectMicroservice<MicroserviceOptions>({
        transport: Transport.KAFKA,
        options: {
            client: {
                clientId: `${KAFKA_CLIENT_ID}-events`,
                brokers: [KAFKA_BROKER],
            },
            consumer: {
                groupId: 'events-service-group',
            },
        },
    });

    await app.startAllMicroservices();

    await app.listen(SERVICES_PORTS.EVENTS_SERVICE);

    logger.log(`Events service is running on port ${SERVICES_PORTS.EVENTS_SERVICE}`);
    logger.log(`Kafka broker: ${KAFKA_BROKER}`);
}

bootstrap();
