import {ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus, Logger} from "@nestjs/common";
import {Response} from "express";
import {AppResponseDto} from "@app/contracts";
import {HttpStatusText} from "@app/common/enums";
import {ValidationException} from "@app/common/exceptions";

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
    private readonly logger: Logger = new Logger(AllExceptionsFilter.name);

    catch(exception: any, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();

        const appResponse: AppResponseDto<undefined | null> = {
            status: HttpStatusText.FAIL,
            data: undefined,
        };

        // Handle validation exceptions
        if (exception instanceof ValidationException) {
            const messages = exception.getResponse();

            appResponse.validationErrors = Array.isArray(messages)
                ? messages
                : [];

            return response
                .status(exception.getStatus())
                .json(appResponse);
        }

        // Handle HTTP exceptions
        if (exception instanceof HttpException) {
            const status = exception.getStatus();

            appResponse.status =
                status < 500
                    ? HttpStatusText.FAIL
                    : HttpStatusText.ERROR;

            appResponse.message = exception.message || 'Something went wrong. Please try again later';
            appResponse.data = status < 500 ? null : undefined;

            return response
                .status(exception.getStatus())
                .json(appResponse);
        }

        // Handle other exceptions
        appResponse.status = HttpStatusText.ERROR;
        appResponse.message = exception.message || 'Internal server error';

        if (exception instanceof Error) {
            this.logger.error(
                exception.message,
                exception.stack,
            );
        } else {
            this.logger.error(exception);
        }

        return response
            .status(HttpStatus.INTERNAL_SERVER_ERROR)
            .json(appResponse);
    }

}