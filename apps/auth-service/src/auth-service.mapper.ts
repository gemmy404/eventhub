import {User} from "@prisma/client";

export class AuthServiceMapper {

    private constructor() {
    }

    static toAuthUserDto(user: User) {
        return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
        };
    }
}