import { Controller, Get } from '@nestjs/common';

@Controller('profiles')
export class ProfilesController {
    //GET /profiles
    @Get()
    findall() {
        return [];
    }
}
