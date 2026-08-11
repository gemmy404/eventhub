import {Body, Controller, Post, UseGuards} from "@nestjs/common";
import {AdminService} from "./admin.service";
import {AppResponseDto, CreateUserRequestDto, RegisterResponseDto, UserRoles} from "@app/contracts";
import {JwtAuthGuard} from "../../../../auth-service/src/jwt-auth.guard";
import {Roles} from "@app/common";
import {RolesGuard} from "../../../../auth-service/src/roles.guard";

@Controller('api/v1/admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRoles.ADMIN)
export class AdminController {

    constructor(private readonly adminService: AdminService) {
    }

    @Post('create-user')
    createUser(@Body() createUserRequest: CreateUserRequestDto): Promise<AppResponseDto<RegisterResponseDto>> {
        return this.adminService.createUser(createUserRequest);
    }
}