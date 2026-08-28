import {ConflictException, Injectable} from "@nestjs/common";
import {AuthServiceRepository} from "../auth-service.repository";
import {CreateUserRequestDto, RegisterResponseDto, UserRoles} from "@app/contracts";
import {hash} from "bcrypt";
import {User, UserRole} from "@prisma/client";
import {AllUsersQueryDto} from "@app/contracts/auth/dto/all-users-query.dto";
import {UserResponseDto} from "@app/contracts/auth/dto/user-response.dto";

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

    async findAllUsers(
        allUsersQuery: AllUsersQueryDto
    ): Promise<{ users: UserResponseDto[], totalElements: number }> {
        const {page, size, role} = allUsersQuery;
        let query: { role?: UserRoles } = {};

        if (role) {
            query.role = role;
        }

        const skip: number = (page - 1) * size;
        const {users, totalElements} = await this.authRepository.findAllUsers(query, size, skip);
        return {
            users: users.map(user => ({
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
            })),
            totalElements: totalElements
        };
    }

}