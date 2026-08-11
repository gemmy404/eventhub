import {Module} from '@nestjs/common';
import {AuthController} from './auth.controller';
import {AuthService} from './auth.service';
import {HttpModule} from "@nestjs/axios";
import {AdminService} from "./admin/admin.service";
import {AdminController} from "./admin/admin.controller";

@Module({
    imports: [
        HttpModule,
    ],
    controllers: [AuthController, AdminController],
    providers: [AuthService, AdminService]
})
export class AuthModule {
}
