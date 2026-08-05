import {Body, Controller, Post} from '@nestjs/common';
import {AuthServiceService} from './auth-service.service';
import {LoginRequestDto, RegisterRequestDto} from "@app/contracts";
import {RegisterResponseDto} from "@app/contracts/auth/dto/register-response.dto";
import {LoginResponseDto} from "@app/contracts/auth/dto/login-response.dto";

@Controller('auth')
export class AuthServiceController {
    constructor(private readonly authServiceService: AuthServiceService) {
    }

    @Post('register')
    register(@Body() registerRequest: RegisterRequestDto): Promise<RegisterResponseDto> {
        return this.authServiceService.register(registerRequest);
    }

    @Post('login')
    login(@Body() loginRequest: LoginRequestDto): Promise<LoginResponseDto> {
        return this.authServiceService.login(loginRequest);
    }
}
