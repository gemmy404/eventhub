import {Injectable} from "@nestjs/common";
import {AppResponseDto, CreateUserRequestDto, EventResponseDto, RegisterResponseDto} from "@app/contracts";
import {HttpService} from "@nestjs/axios";
import {constructPagination, handleServiceError, HttpStatusText, SERVICES_PORTS} from "@app/common";
import {lastValueFrom} from "rxjs";
import {AllUsersQueryDto} from "@app/contracts/auth/dto/all-users-query.dto";
import {UserResponseDto} from "@app/contracts/auth/dto/user-response.dto";

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
                    `${this.ADMIN_SERVICE_URL}/users`,
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

    async findAllUsers(allUsersQuery: AllUsersQueryDto): Promise<AppResponseDto<UserResponseDto[]>> {
        try {
            const {data} = await lastValueFrom(
                this.httpService.get<{ users: UserResponseDto[], totalElements: number }>(
                    `${this.ADMIN_SERVICE_URL}/users`,
                    {
                        params: allUsersQuery,
                    }
                )
            );

            return {
                status: HttpStatusText.SUCCESS,
                data: data.users,
                pagination: constructPagination(data.totalElements, allUsersQuery.page, allUsersQuery.size),
            };
        } catch (err) {
            handleServiceError(err);
        }
    }

}