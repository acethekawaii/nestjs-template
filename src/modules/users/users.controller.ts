import { Body, Controller, Get, NotFoundException, Param, ParseUUIDPipe, Post, UseGuards } from '@nestjs/common';
import { CreateUserDTO } from './dto/create-user.dto';
import { UsersService } from './users.service';
import type { SafeUser } from './types/users.types';
import { PassportJwtGuard } from '../auth/guards/passport-jwt.guard';

@Controller('users')
@UseGuards(PassportJwtGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  async createUser(@Body() body: CreateUserDTO): Promise<SafeUser> {
    const user = await this.usersService.createUser(body);
    return user;
  }

  @Get()
  async getAllUsers(): Promise<SafeUser[]> {
    const users = await this.usersService.getAllUsers();
    return users;
  }

  @Get(':id')
  async getUser(@Param('id', ParseUUIDPipe) id: string): Promise<SafeUser> {
    const user = await this.usersService.getUser(id);
    if (!user) throw new NotFoundException('User not found');
    return user;
  }
}
