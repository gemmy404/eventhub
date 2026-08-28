import {Body, Controller, Get, Post, Query, UseGuards} from "@nestjs/common";
import {AdminService} from "./admin.service";
import {AppResponseDto, CreateUserRequestDto, RegisterResponseDto, UserRoles} from "@app/contracts";
import {JwtAuthGuard} from "../../../../auth-service/src/jwt-auth.guard";
import {Roles} from "@app/common";
import {RolesGuard} from "../../../../auth-service/src/roles.guard";
import {AllUsersQueryDto} from "@app/contracts/auth/dto/all-users-query.dto";
import {UserResponseDto} from "@app/contracts/auth/dto/user-response.dto";

@Controller('api/v1/admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRoles.ADMIN)
export class AdminController {

    constructor(private readonly adminService: AdminService) {
    }

    @Post('users')
    createUser(@Body() createUserRequest: CreateUserRequestDto): Promise<AppResponseDto<RegisterResponseDto>> {
        return this.adminService.createUser(createUserRequest);
    }

    @Get('users')
    getAllUsers(@Query() allUsersQuery: AllUsersQueryDto): Promise<AppResponseDto<UserResponseDto[]>> {
        return this.adminService.findAllUsers(allUsersQuery);
    }

}