import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from "@nestjs/jwt";
import { UsersService } from '../users/users.service';
import * as bcrypt  from 'bcryptjs';
import { LoginDto } from '../users/dto/login.dto';

@Injectable()
export class AuthService {

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  private async validateUser(username: string, pass: string){
    const user = await this.usersService.findByUsername(username);
    if(user && await bcrypt.compare(pass, user.password)){
        const { password, ...sanitized} = user;
        return sanitized;
    }
    return null;
  }

  async login(dto: LoginDto){
    const user = await this.validateUser(dto.username, dto.password);
    if(!user) throw new UnauthorizedException('Credenciales incorrectas');

    const payload = { sub: user.id, role: user.role };
    return {
      access_token: this.jwtService.sign(payload)
    }
  }

}
