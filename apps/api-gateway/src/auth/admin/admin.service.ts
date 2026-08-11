import {Injectable} from "@nestjs/common";
import {AppResponseDto, CreateUserRequestDto, RegisterResponseDto} from "@app/contracts";
import {HttpService} from "@nestjs/axios";
import {handleServiceError, HttpStatusText, SERVICES_PORTS} from "@app/common";
import {lastValueFrom} from "rxjs";

@Injectable()
export class AdminService {

    private readonly ADMIN_SERVICE_URL: string =
        `http://localhost:${SERVICES_PORTS.AUTH_SERVICE}/admin`;

    constructor(private readonly httpService: HttpService) {

    }

    async createUser(createUserRequest: CreateUserRequestDto): Promise<AppResponseDto<RegisterResponseDto>> {
        try {
            const {data} = await lastValueFrom(
                this.httpService.post<RegisterResponseDto>(
                    `${this.ADMIN_SERVICE_URL}/create-user`,
                    createUserRequest,
                )
            );

            return {
                status: HttpStatusText.SUCCESS,
                data: data,
                message: 'User created successfully',
            };
        } catch (err) {
            handleServiceError(err);
        }
    }

}