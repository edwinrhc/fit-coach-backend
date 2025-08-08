import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

export interface JwtPayload {
  sub: string;
  email: string;
  role?: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET,
    });
  }

  // async validate(payload: { sub: string; role: string }) {
  //   // payload.sub = userId, payload.role = rol
  //   return { userId: payload.sub, role: payload.role };
  // }

  // Lo que retornes aquí termina en req.user
  async validate(payload: JwtPayload) {
    const role = payload.role ?? null; // puede no venir
    return {
      userId: payload.sub,
      email: payload.email,
      role,                      // <-- string
      roles: role ? [role] : [], // <-- array
    };
  }
}
