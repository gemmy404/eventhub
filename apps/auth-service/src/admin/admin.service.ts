import {ConflictException, Injectable} from "@nestjs/common";
import {AuthServiceRepository} from "../auth-service.repository";
import {CreateUserRequestDto, RegisterResponseDto, UserRegisteredEvent, UserRoles} from "@app/contracts";
import {hash} from "bcrypt";
import {User, UserRole} from "@prisma/client";
import {KAFKA_TOPICS} from "@app/kafka";

@Injectable()
export class AdminService {

    constructor(private readonly authRepository: AuthServiceRepository) {

    }

    async createUser(createUserRequest: CreateUserRequestDto): Promise<RegisterResponseDto> {
        const existingUser = await this.authRepository.findUserByEmail(
            createUserRequest.email
        );
        if (existingUser) {
            throw new ConflictException('Email already taken, please try another one');
        }

        const hashedPassword: string = await hash(createUserRequest.password, 10);

        const roleMap: Record<UserRoles, UserRole> = {
            [UserRoles.USER]: UserRole.USER,
            [UserRoles.ORGANIZER]: UserRole.ORGANIZER,
            [UserRoles.ADMIN]: UserRole.ADMIN,
        };
        const createdUser = await this.authRepository.createUser({
            name: createUserRequest.name,
            email: createUserRequest.email,
            password: hashedPassword,
            role: roleMap[createUserRequest.role]
        } as User);

        return {userId: createdUser.id};
    }

}