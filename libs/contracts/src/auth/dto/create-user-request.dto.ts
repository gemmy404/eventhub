import {IsEnum, IsNotEmpty} from "class-validator";
import {UserRoles} from "../enums/user-roles.enum";
import {RegisterRequestDto} from "./register-request.dto";

export class CreateUserRequestDto extends RegisterRequestDto {
    @IsNotEmpty({message: 'Role is required'})
    @IsEnum(UserRoles, {message: `Role must be one of the following: ${Object.values(UserRoles).join(', ')}`})
    role: UserRoles;
}