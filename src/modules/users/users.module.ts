import { Module } from '@nestjs/common';
import { UsersService } from './services/users.service';
import { UsersController } from './users.controller';
import { User } from './entities/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmailVerification } from '../email/entities/email-verificacion.entity';
import { MailModule } from '../email/mail.module';
import { EmailVerificationService } from './services/email-verification.service';

@Module({
  imports: [TypeOrmModule.forFeature([User, EmailVerification]), MailModule],
  providers: [UsersService, EmailVerificationService],
  controllers: [UsersController],
  exports: [UsersService]
})
export class UsersModule {}
