import {CanActivate, ExecutionContext, ForbiddenException, Injectable} from "@nestjs/common";
import {Reflector} from "@nestjs/core";
import {ROLES_KEY} from "@app/common";
import {CurrentUserDto} from "@app/contracts";

@Injectable()
export class RolesGuard implements CanActivate {

    constructor(private reflector: Reflector) {
    }

    canActivate(context: ExecutionContext): boolean {
        const requiredRoles: string[] = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);

        if (!requiredRoles || requiredRoles.length === 0) return true;

        const user = context.switchToHttp().getRequest().user as CurrentUserDto;

        if (!user || !user.role) {
            throw new ForbiddenException('Access denied: No roles assigned to user');
        }

        const hasRole: boolean = requiredRoles.includes(user.role);

        if (!hasRole) {
            throw new ForbiddenException('You do not have the necessary permissions to access this resource');
        }

        return true;
    }

}