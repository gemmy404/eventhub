import {Body, Controller, Post} from "@nestjs/common";
import {AdminService} from "./admin.service";
import {CreateUserRequestDto, RegisterResponseDto} from "@app/contracts";

@Controller('admin')
export class AdminController {

    constructor(private readonly adminService: AdminService) {
    }

    @Post('create-user')
    createUser(@Body() createUserRequest: CreateUserRequestDto): Promise<RegisterResponseDto> {
        return this.adminService.createUser(createUserRequest);
    }
}