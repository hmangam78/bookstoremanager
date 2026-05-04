import { Controller, Get, Query, Param, Post, Body, Put, Delete, HttpCode, HttpStatus, NotFoundException, ParseUUIDPipe, ValidationPipe } from '@nestjs/common';
import { CreateProfileDto } from './dto/create-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ProfilesService } from './profiles.service';
import type { UUID } from 'crypto';

@Controller('profiles')
export class ProfilesController {
    constructor(private profilesService: ProfilesService) {}

    @Get()
    findall() {
        return this.profilesService.findAll();
    }
    
    @Get(':id')
    findOne(@Param('id', ParseUUIDPipe) id: UUID) {
        try {
            return this.profilesService.findOne(id);
        } catch(error) {
            throw new NotFoundException(error.message);
        }
    }

    @Post()
    create(@Body(new ValidationPipe()) createProfileDto: CreateProfileDto) {
        return this.profilesService.createProfile(createProfileDto);
    }

    @Put(':id')
    update(
        @Param('id', ParseUUIDPipe) id: UUID,
        @Body(new ValidationPipe()) updateProfileDto: UpdateProfileDto
    ) {
        return this.profilesService.updateProfile(updateProfileDto, id);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    remove(@Param('id', ParseUUIDPipe) id: UUID) {
        this.profilesService.deleteProfile(id);
    }

}

