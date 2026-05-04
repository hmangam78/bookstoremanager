import { Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { CreateProfileDto } from './dto/create-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';

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
        const matchingProfile = this.profiles.find((profile) => profile.id === id);
        if (!matchingProfile) {
            throw new Error(`Profile with ID ${id} not found`);
        }
        return matchingProfile;
    }

    createProfile(createProfileDto: CreateProfileDto) {
         const newProfile = {
            id: randomUUID(),
            ...createProfileDto
         };
         this.profiles.push(newProfile);
         return newProfile;
    }

    updateProfile(updateProfileDto: UpdateProfileDto, id: string) {
        const profileToUpdate = this.profiles.find((profile) => profile.id === id);

        if (!profileToUpdate) {
            throw new NotFoundException(`Profile with ID ${id} not found`);
        }

        profileToUpdate.name = updateProfileDto.name;
        profileToUpdate.description = updateProfileDto.description;

        return profileToUpdate;;
    }

    deleteProfile(id: string): void {
        const profileToDelete = this.profiles.find((profile) => profile.id === id);

        if (!profileToDelete) {
            throw new NotFoundException(`Profile with ID ${id} not found`);
        }

        this.profiles = this.profiles.filter(item => item.id !== id);
    }
}
