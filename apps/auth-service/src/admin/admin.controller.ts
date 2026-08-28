import {Body, Controller, Get, Post, Query} from "@nestjs/common";
import {AdminService} from "./admin.service";
import {CreateUserRequestDto, RegisterResponseDto} from "@app/contracts";
import {AllUsersQueryDto} from "@app/contracts/auth/dto/all-users-query.dto";
import {UserResponseDto} from "@app/contracts/auth/dto/user-response.dto";

@Controller('admin')
export class AdminController {

    constructor(private readonly adminService: AdminService) {
    }

    @Post('users')
    createUser(@Body() createUserRequest: CreateUserRequestDto): Promise<RegisterResponseDto> {
        return this.adminService.createUser(createUserRequest);
    }

    @Get('users')
    getAllUsers(@Query() allUsersQuery: AllUsersQueryDto): Promise<{ users: UserResponseDto[], totalElements: number }> {
        return this.adminService.findAllUsers(allUsersQuery);
    }

}