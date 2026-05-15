import { Controller, Post, Body, Headers, UnauthorizedException } from '@nestjs/common';
import { AuthService, AuthLevel } from './auth.service';
import { SettingsService } from 'src/settings/settings.service';
import { IsString } from 'class-validator';

class LoginDTO {
    @IsString()
    password: string;
}

class ChangePasswordDTO {
    @IsString()
    settingKey: string;

    @IsString()
    newPassword: string;
}

@Controller('auth')
export class AuthController {
    constructor(
        private readonly authService: AuthService,
        private readonly settingsService: SettingsService,
    ) {}

    @Post('login')
    async login(@Body() body: LoginDTO) {
        const result = await this.authService.login(body.password);
        return result;
    }

    @Post('change-password')
    async changePassword(
        @Body() body: ChangePasswordDTO,
        @Headers('authorization') authHeader: string,
    ) {
        const token = this.extractToken(authHeader);
        await this.authService.changePassword(token, body.settingKey, body.newPassword);
        return { message: 'Contraseña actualizada correctamente' };
    }

    @Post('logout')
    async logout(@Headers('authorization') authHeader: string) {
        const token = this.extractToken(authHeader);
        this.authService.logout(token);
        return { message: 'Sesión cerrada' };
    }

    @Post('check')
    async checkSession(
        @Headers('authorization') authHeader: string,
    ) {
        const token = this.extractToken(authHeader);
        try {
            this.authService.validate(token, AuthLevel.USER);
            let level = AuthLevel.USER;
            try {
                this.authService.validate(token, AuthLevel.ADMIN);
                level = AuthLevel.ADMIN;
            } catch {
                // not admin, that's fine
            }
            return { valid: true, level };
        } catch {
            throw new UnauthorizedException('Sesión inválida');
        }
    }

    private extractToken(authHeader: string | undefined): string {
        if (!authHeader) {
            throw new UnauthorizedException('No se proporcionó token de autenticación');
        }
        // Expect format: "Bearer <token>"
        const parts = authHeader.split(' ');
        if (parts.length !== 2 || parts[0] !== 'Bearer') {
            throw new UnauthorizedException('Formato de autenticación inválido');
        }
        return parts[1];
    }
}
