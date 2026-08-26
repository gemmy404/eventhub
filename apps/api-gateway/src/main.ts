import {NestFactory} from '@nestjs/core';
import {AppModule} from './app.module';
import {SERVICES_PORTS} from "@app/common";
import {Logger} from "@nestjs/common";

const logger = new Logger('ApiGateway');

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    app.enableCors();

    await app.listen(SERVICES_PORTS.API_GATEWAY);
    logger.log(`API Gateway is running on port ${SERVICES_PORTS.API_GATEWAY}`)
}

bootstrap();
