import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { Roles } from './roles/roles.decorator';
import { AuthGuard } from '@nestjs/passport';
import { Role } from '../users/role.enum';
import { RolesGuard } from './roles/roles.guard';
import { LoginDto } from '../users/dto/login.dto';

@Controller('auth')
export class AuthController {

  constructor(
    private authService: AuthService,
  ) {}

  @Post('register')
  // @UseGuards(AuthGuard('jwt'), RolesGuard)
  // @Roles(Role.ADMIN)
  register(@Body() dto: CreateUserDto){
    return this.authService['usersService'].create(dto);
  }

  @Post('login')
  login(@Body() dto: LoginDto){
    return this.authService.login(dto);
  }


}
