import { Injectable, Logger } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class MailService {

  private readonly logger = new Logger(MailService.name);

  constructor(private readonly mailer: MailerService) {}


  async sendEmailConfirmation(to: string, username: string, confirmUrl: string){

    try{
     await this.mailer.sendMail({
       to,
       subject: 'Confirm tu correo',
       template: 'confirm-email', // Templates/confirm-email.hbs
       context: { username, confirmUrl },
     });
     this.logger.log(`Email de confirmación enviado a ${to}`);
    }catch (e){
      this.logger.error(`Error enviando email a ${to}`, e?.stack);
    }

  }



}
