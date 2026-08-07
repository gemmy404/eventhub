import {ConflictException, Inject, Injectable, OnModuleInit, UnauthorizedException} from '@nestjs/common';
import {KAFKA_SERVICE, KAFKA_TOPICS} from "@app/kafka";
import {ClientKafka} from "@nestjs/microservices";
import {
    LoginRequestDto,
    LoginResponseDto,
    RegisterRequestDto,
    RegisterResponseDto,
    UserRegisteredEvent
} from "@app/contracts";
import {AuthServiceRepository} from "./auth-service.repository";
import {compare, hash} from "bcrypt";
import {User} from "@prisma/client";
import {JwtService} from "@nestjs/jwt";
import {AuthServiceMapper} from "./auth-service.mapper";

@Injectable()
export class AuthServiceService implements OnModuleInit {

    constructor(
        @Inject(KAFKA_SERVICE) private readonly kafkaClient: ClientKafka,
        private readonly authRepository: AuthServiceRepository,
        private readonly jwtService: JwtService,
    ) {
    }

    async onModuleInit() {
        // connecting to kafka when the module is initialized
        await this.kafkaClient.connect();
    }

    async register(registerRequest: RegisterRequestDto): Promise<RegisterResponseDto> {
        const existingUser = await this.authRepository.findUserByEmail(registerRequest.email);
        if (existingUser) {
            throw new ConflictException('Email already taken, please try another one');
        }

        const hashedPassword: string = await hash(registerRequest.password, 10);

        const createdUser = await this.authRepository.createUser({
            ...registerRequest,
            password: hashedPassword,
        } as User);


        const userRegisteredEvent: UserRegisteredEvent = {
            userId: createdUser.id,
            email: createdUser.email,
            name: createdUser.name,
        };
        this.kafkaClient.emit(KAFKA_TOPICS.USER_REGISTERED, userRegisteredEvent);

        return {userId: createdUser.id};
    }

    async login(loginRequest: LoginRequestDto): Promise<LoginResponseDto> {
        const savedUser = await this.authRepository.findUserByEmail(loginRequest.email);
        if (!savedUser || !(await compare(loginRequest.password, savedUser.password))) {
            throw new UnauthorizedException('Email or password is incorrect');
        }

        const token = this.jwtService.sign({id: savedUser.id, email: savedUser.email, role: savedUser.role});

        this.kafkaClient.emit(KAFKA_TOPICS.USER_LOGIN, {
            userId: savedUser.id,
            timestamp: new Date().toISOString(),
        });

        return {accessToken: token, user: AuthServiceMapper.toAuthUserDto(savedUser)};
    }

}
