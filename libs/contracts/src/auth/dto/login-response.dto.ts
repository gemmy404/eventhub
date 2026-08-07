import {IAuthUser} from "@app/common";

export class LoginResponseDto {
    accessToken: string;
    user: IAuthUser;
}