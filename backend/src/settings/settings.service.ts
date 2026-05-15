import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Setting } from './entities/setting.entity';
import * as bcrypt from 'bcrypt';

const SALT_ROUNDS = 10;

@Injectable()
export class SettingsService implements OnModuleInit {

    constructor(
        @InjectRepository(Setting)
        private readonly settingRepo: Repository<Setting>,
    ) {}

    /**
     * On startup, ensure default settings exist if the table is empty.
     */
    async onModuleInit() {
        const adminPw = await this.get('admin_password');
        if (!adminPw) {
            const hash = await bcrypt.hash('admin', SALT_ROUNDS);
            await this.set('admin_password', hash);
        }

        const userPw = await this.get('user_password');
        if (!userPw) {
            const hash = await bcrypt.hash('user', SALT_ROUNDS);
            await this.set('user_password', hash);
        }
    }

    async get(key: string): Promise<string | null> {
        const setting = await this.settingRepo.findOneBy({ key });
        return setting?.value ?? null;
    }

    async set(key: string, value: string): Promise<void> {
        const existing = await this.settingRepo.findOneBy({ key });
        if (existing) {
            existing.value = value;
            await this.settingRepo.save(existing);
        } else {
            const setting = this.settingRepo.create({ key, value });
            await this.settingRepo.save(setting);
        }
    }

    /**
     * Verify a plaintext password against the stored hash for a given key.
     */
    async verify(key: string, plaintext: string): Promise<boolean> {
        const hash = await this.get(key);
        if (!hash) return false;
        return bcrypt.compare(plaintext, hash);
    }

    /**
     * Hash and update a password setting.
     */
    async updatePassword(key: string, newPassword: string): Promise<void> {
        const hash = await bcrypt.hash(newPassword, SALT_ROUNDS);
        await this.set(key, hash);
    }
}
