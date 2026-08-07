import {HttpException} from "@nestjs/common";

export const handleServiceError: (error: any) => never = (error: any): never => {
    if (error.response) {
        throw new HttpException(error.response.data, error.response.status);
    } else {
        const errorData = {
            message: error.message || 'Service is not available',
            error: error.error || "Service Unavailable",
            statusCode: error.statusCode || 503,
        }
        throw new HttpException(errorData, 503);
    }
}