import {Body, Controller, Post} from '@nestjs/common';
import {AuthService} from "./auth.service";
import {
    AppResponseDto,
    LoginRequestDto,
    LoginResponseDto,
    RegisterRequestDto,
    RegisterResponseDto
} from "@app/contracts";

@Controller('api/v1/auth')
export class AuthController {


    constructor(private readonly authService: AuthService) {
    }

    @Post('register')
    register(@Body() registerRequest: RegisterRequestDto): Promise<AppResponseDto<RegisterResponseDto>> {
        return this.authService.register(registerRequest);
    }

    @Post('login')
    login(@Body() loginRequest: LoginRequestDto): Promise<AppResponseDto<LoginResponseDto>> {
        return this.authService.login(loginRequest);
    }

}
