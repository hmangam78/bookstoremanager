import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { CreateProfileDto } from './dto/create-profile.dto';

@Injectable()
export class ProfilesService {
    private profiles = [
        {
            id: randomUUID(),
            name: 'Hector Gamiz',
            description: 'Software developer.'
        },
        {
            id: randomUUID(),
            name: 'Martin Gamiz',
            description: 'Estudiante de primaria'
        },
        {
            id: randomUUID(),
            name: 'Ana Moreno',
            description: 'Estudiante de programación'
        },
    ];

    findAll() {
        return this.profiles;
    }

    findOne(id: string) {
        return this.profiles.find((profile) => profile.id === id);
    }

    createProfile(createProfileDto: CreateProfileDto) {
         const newProfile = {
            id: randomUUID(),
            ...createProfileDto
         };
         this.profiles.push(newProfile);
         return newProfile;
    }

    updateProfile()
}
