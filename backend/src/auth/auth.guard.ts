import { Injectable, CanActivate, ExecutionContext, SetMetadata } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthService, AuthLevel } from './auth.service';

export const REQUIRED_LEVEL_KEY = 'requiredAuthLevel';

/**
 * Attach this decorator to a route to require a specific auth level.
 * Usage: @RequireAuth(AuthLevel.ADMIN)
 */
export const RequireAuth = (level: AuthLevel) => SetMetadata(REQUIRED_LEVEL_KEY, level);

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(
        private readonly reflector: Reflector,
        private readonly authService: AuthService,
    ) {}

    canActivate(context: ExecutionContext): boolean {
        const requiredLevel = this.reflector.getAllAndOverride<AuthLevel>(REQUIRED_LEVEL_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);

        // If no auth level is specified on the route, allow access
        if (!requiredLevel) {
            return true;
        }

        const request = context.switchToHttp().getRequest();
        const authHeader = request.headers['authorization'];
        const token = this.extractToken(authHeader);

        this.authService.validate(token, requiredLevel);
        return true;
    }

    private extractToken(authHeader: string | undefined): string | undefined {
        if (!authHeader) return undefined;
        const parts = authHeader.split(' ');
        if (parts.length !== 2 || parts[0] !== 'Bearer') return undefined;
        return parts[1];
    }
}
