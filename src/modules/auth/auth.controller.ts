import { BadRequestException, Body, Controller, Get, HttpCode, Post, Query, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { Roles } from './roles/roles.decorator';
import { AuthGuard } from '@nestjs/passport';
import { Role } from '../users/role.enum';
import { RolesGuard } from './roles/roles.guard';
import { LoginDto } from '../users/dto/login.dto';
import { EmailVerificationService } from '../users/services/email-verification.service';
import { ApiOperation, ApiQuery } from '@nestjs/swagger';
import { UsersService } from '../users/services/users.service';

@Controller('auth')
export class AuthController {

  constructor(
    private authService: AuthService,
    private readonly emailVerification: EmailVerificationService,
    private readonly usersService: UsersService,
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



  @Get('confirm-email')
  @HttpCode(200)
  @ApiOperation({ summary: 'Confirma email de usuario por token'})
  @ApiQuery({ name: 'token', required: true})
  async confirmEmail(@Query('token') token: string){
    await this.emailVerification.confirmEmailByToken(token);
    return { message: 'Email confirmado exitosamente' };
  }


  @Get('resend-confirmation')
  @HttpCode(200)
  @ApiOperation({ summary: 'Reenviar correo de confirmación' })
  @ApiQuery({ name: 'email', required: true })
  async resend(@Query('email') email: string) {
    const user = await this.usersService.findByEmail(email); // ← devuelve User tipado

    if (user.emailVerified) {
      throw new BadRequestException('El email ya está verificado');
    }

    await this.emailVerification.createAndSend(user); // ← ahora sí compila
    return { message: 'Correo de confirmación reenviado' };
  }




}
