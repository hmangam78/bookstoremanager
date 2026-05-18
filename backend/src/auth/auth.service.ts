import { Injectable, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { randomBytes } from 'node:crypto';
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

    private readonly sessionTtlMs = 12 * 60 * 60 * 1000;

    /**
     * In-memory session store.
     * Maps a session token (random string) -> auth level and expiry.
     * For a local app this is fine; it resets when the server restarts.
     */
    private readonly sessions = new Map<string, { level: AuthLevel; expiresAt: number }>();

    constructor(
        private readonly settingsService: SettingsService,
    ) {}

    /**
     * Attempt to log in with a given password.
     * Returns a session token on success, or throws on failure.
     */
    async login(password: string): Promise<{ token: string; level: AuthLevel }> {
        if (!(await this.settingsService.isAuthConfigured())) {
            throw new UnauthorizedException('El sistema requiere configuración inicial');
        }

        // Try admin first (admin password also grants user access)
        const isAdmin = await this.settingsService.verify('admin_password', password);
        if (isAdmin) {
            const token = this.generateToken();
            this.sessions.set(token, { level: AuthLevel.ADMIN, expiresAt: Date.now() + this.sessionTtlMs });
            return { token, level: AuthLevel.ADMIN };
        }

        // Try user password
        const isUser = await this.settingsService.verify('user_password', password);
        if (isUser) {
            const token = this.generateToken();
            this.sessions.set(token, { level: AuthLevel.USER, expiresAt: Date.now() + this.sessionTtlMs });
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

        const session = this.sessions.get(token);
        if (!session) {
            throw new UnauthorizedException('Sesión inválida o expirada');
        }

        if (session.expiresAt <= Date.now()) {
            this.sessions.delete(token);
            throw new UnauthorizedException('Sesión inválida o expirada');
        }

        const grantedLevel = session.level;

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

    async setupInitialPasswords(adminPassword: string, userPassword: string): Promise<{ token: string; level: AuthLevel }> {
        if (await this.settingsService.isAuthConfigured()) {
            throw new ForbiddenException('La configuración inicial ya fue completada');
        }

        await this.settingsService.setInitialPasswords(adminPassword, userPassword);
        return this.login(adminPassword);
    }

    /**
     * Log out: invalidate a session token.
     */
    logout(token: string): void {
        this.sessions.delete(token);
    }

    private generateToken(): string {
        return randomBytes(32).toString('hex');
    }
}
