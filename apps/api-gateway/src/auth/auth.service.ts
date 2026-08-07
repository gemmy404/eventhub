import {Injectable} from '@nestjs/common';
import {HttpService} from "@nestjs/axios";
import {handleServiceError, HttpStatusText, SERVICES_PORTS} from "@app/common";
import {
    AppResponseDto,
    LoginRequestDto,
    LoginResponseDto,
    RegisterRequestDto,
    RegisterResponseDto
} from "@app/contracts";
import {lastValueFrom} from "rxjs";

@Injectable()
export class AuthService {

    private readonly AUTH_SERVICE_URL: string =
        `http://localhost:${SERVICES_PORTS.AUTH_SERVICE}/auth`;

    constructor(
        private readonly httpService: HttpService,
    ) {
    }

    async register(registerRequest: RegisterRequestDto): Promise<AppResponseDto<RegisterResponseDto>> {
        try {
            const {data} = await lastValueFrom(
                this.httpService.post<RegisterResponseDto>(
                    `${this.AUTH_SERVICE_URL}/register`,
                    registerRequest,
                )
            );

            return {
                status: HttpStatusText.SUCCESS,
                message: 'User register successfully',
                data: data,
            };
        } catch (err) {
            handleServiceError(err);
        }
    }

    async login(loginRequest: LoginRequestDto): Promise<AppResponseDto<LoginResponseDto>> {
        try {
            const {data} = await lastValueFrom(
                this.httpService.post<LoginResponseDto>(
                    `${this.AUTH_SERVICE_URL}/login`,
                    loginRequest,
                )
            );

            return {
                status: HttpStatusText.SUCCESS,
                message: 'User logged in successfully',
                data: data,
            }
        } catch (err) {
            handleServiceError(err);
        }
    }

}
