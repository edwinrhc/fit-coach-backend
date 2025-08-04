import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './jwt.strategy';
import { RolesGuard } from './roles/roles.guard';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UsersModule } from '../users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';


@Module({

  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (cs: ConfigService) => ({
        secret: cs.get<string>("JWT_SECRET"),
        signOptions: { expiresIn: cs.get<string>("JWT_EXPIRES_IN")}
      })
    }),
    // Módulo de usuarios
    UsersModule,

    // Passport: registra la estrategia 'jwt'
    PassportModule.register({ defaultStrategy: 'jwt' }),

    // JWT: configura el secret y la expiración
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: process.env.JWT_EXPIRES_IN }
    }),

    TypeOrmModule.forFeature([User])

  ],
  providers: [AuthService, JwtStrategy, RolesGuard],
  controllers: [AuthController],
  exports: [PassportModule, JwtModule]
})
export class AuthModule {}
