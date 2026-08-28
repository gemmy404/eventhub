import {PaginationQueryDto} from "@app/contracts/pagination";
import {IsEnum, IsOptional} from "class-validator";
import {UserRoles} from "@app/contracts/auth";

export class AllUsersQueryDto extends PaginationQueryDto {
    @IsOptional()
    @IsEnum(UserRoles, {message: `Role must be one of the following values: ${Object.values(UserRoles).join(', ')}`})
    role?: UserRoles;
}