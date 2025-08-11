import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EmailVerification } from '../../email/entities/email-verificacion.entity';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { MailService } from '../../email/mail.service';
import { User } from '../entities/user.entity';
import { randomUUID } from 'crypto';
import { addMinutes, isAfter } from 'date-fns';


@Injectable()
export class EmailVerificationService {

  constructor(
    @InjectRepository(EmailVerification)
    private readonly verifRepo: Repository<EmailVerification>,
    private readonly cfg: ConfigService,
    private readonly mail: MailService,
  ) { }

  async createAndSend(user: User): Promise<void> {
    // limpia tokens viejos no usados del mismo user (opcional)
    await this.verifRepo.delete({ user });

    const token = randomUUID();
    const ttl = parseInt(this.cfg.get<string>('TOKEN_EMAIL_TTL_MIN') ?? '60', 10);
    const expiresAt = addMinutes(new Date(), ttl);

    const ev = this.verifRepo.create({ token, user, expiresAt });
    await this.verifRepo.save(ev);

    const appUrl = this.cfg.get<string>('APP_URL')!;
    const confirmUrl = `${appUrl}/api/v1/auth/confirm-email?token=${encodeURIComponent(token)}`;

    await this.mail.sendEmailConfirmation(user.email, user.username, confirmUrl);
  }


  async confirmEmailByToken(token: string): Promise<void>{
    const ev = await this.verifRepo.findOne({ where: { token } });
    if(!ev) throw new NotFoundException('Token inválido');

    if(ev.used) throw new BadRequestException('Token ya utilizado');

    if(isAfter(new Date(), ev.expiresAt)){
      throw new BadRequestException('Token expirado');
    }

    ev.user.emailVerified = true;
    ev.used = true;

    await this.verifRepo.manager.transaction(async  (trx) => {
      await trx.save(ev.user);
      await trx.save(ev);
    });
  }




}