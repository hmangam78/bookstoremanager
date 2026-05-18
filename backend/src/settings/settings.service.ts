import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Setting } from './entities/setting.entity';
import * as bcrypt from 'bcrypt';

const SALT_ROUNDS = 10;

@Injectable()
export class SettingsService {

    constructor(
        @InjectRepository(Setting)
        private readonly settingRepo: Repository<Setting>,
    ) {}

    async get(key: string): Promise<string | null> {
        const setting = await this.settingRepo.findOneBy({ key });
        return setting?.value ?? null;
    }

    async isAuthConfigured(): Promise<boolean> {
        const [adminPw, userPw] = await Promise.all([
            this.get('admin_password'),
            this.get('user_password'),
        ]);

        return !!adminPw && !!userPw;
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

    async setInitialPasswords(adminPassword: string, userPassword: string): Promise<void> {
        const [adminHash, userHash] = await Promise.all([
            bcrypt.hash(adminPassword, SALT_ROUNDS),
            bcrypt.hash(userPassword, SALT_ROUNDS),
        ]);

        await this.settingRepo.manager.transaction(async (manager) => {
            const repository = manager.getRepository(Setting);
            await repository.save(repository.create({ key: 'admin_password', value: adminHash }));
            await repository.save(repository.create({ key: 'user_password', value: userHash }));
        });
    }
}
