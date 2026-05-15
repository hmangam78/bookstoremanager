import { Injectable, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { SettingsService } from 'src/settings/settings.service';

/**
 * Which "password level" is required for a given operation.
 */
export enum AuthLevel {
    /** No password needed — public */
    NONE = 'none',
    /** Regular user password */
    USER = 'user',
    /** Admin password */
    ADMIN = 'admin',
}

@Injectable()
export class AuthService {

    /**
     * In-memory session store.
     * Maps a session token (random string) -> auth level granted.
     * For a local app this is fine; it resets when the server restarts.
     */
    private readonly sessions = new Map<string, AuthLevel>();

    constructor(
        private readonly settingsService: SettingsService,
    ) {}

    /**
     * Attempt to log in with a given password.
     * Returns a session token on success, or throws on failure.
     */
    async login(password: string): Promise<{ token: string; level: AuthLevel }> {
        // Try admin first (admin password also grants user access)
        const isAdmin = await this.settingsService.verify('admin_password', password);
        if (isAdmin) {
            const token = this.generateToken();
            this.sessions.set(token, AuthLevel.ADMIN);
            return { token, level: AuthLevel.ADMIN };
        }

        // Try user password
        const isUser = await this.settingsService.verify('user_password', password);
        if (isUser) {
            const token = this.generateToken();
            this.sessions.set(token, AuthLevel.USER);
            return { token, level: AuthLevel.USER };
        }

        throw new UnauthorizedException('Contraseña incorrecta');
    }

    /**
     * Validate a session token against a required auth level.
     * Throws if not authorized.
     */
    validate(token: string | undefined, requiredLevel: AuthLevel): void {
        if (requiredLevel === AuthLevel.NONE) return;

        if (!token) {
            throw new UnauthorizedException('Se requiere autenticación');
        }

        const grantedLevel = this.sessions.get(token);
        if (!grantedLevel) {
            throw new UnauthorizedException('Sesión inválida o expirada');
        }

        // ADMIN level satisfies ADMIN or USER requirements
        if (requiredLevel === AuthLevel.ADMIN && grantedLevel !== AuthLevel.ADMIN) {
            throw new ForbiddenException('Se requieren permisos de administrador');
        }

        // If we get here, the user has sufficient level
    }

    /**
     * Change a password setting. Only admin-level tokens can do this.
     */
    async changePassword(token: string | undefined, settingKey: string, newPassword: string): Promise<void> {
        this.validate(token, AuthLevel.ADMIN);

        if (settingKey !== 'admin_password' && settingKey !== 'user_password') {
            throw new ForbiddenException('Solo se pueden cambiar contraseñas del sistema');
        }

        await this.settingsService.updatePassword(settingKey, newPassword);
    }

    /**
     * Log out: invalidate a session token.
     */
    logout(token: string): void {
        this.sessions.delete(token);
    }

    private generateToken(): string {
        const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        for (let i = 0; i < 32; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    }
}
