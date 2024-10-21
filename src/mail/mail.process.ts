import { Process } from '@nestjs/bull';
import { Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { MailService } from './mail.service';

@Processor('mailQueue')
export class MailProcessor {
  constructor(private readonly mailService: MailService) {}

  @Process('sendResetMail')
  async handleSendResetMail(job: Job) {
    const { username, to, token } = job.data;
    try {
      await this.mailService.sendPasswordResetEmail(to, token, username);
    } catch (error) {
      throw new Error('Sending Email failed');
    }
  }

  @Process('sendNewProduct')
  async handleNewProductMail(job: Job) {
    const {
      to,
      name,
      description,
      imagePath,
      price,
      category,
      quantity,
      discount,
      size,
    } = job.data;
    try {
      await this.mailService.sendNewProduct(
        to,
        name,
        description,
        imagePath,
        price,
        category,
        quantity,
        discount,
        size,
      );
    } catch (error) {
      throw new Error('Sending Email failed');
    }
  }

  @Process('sendEmailMessage')
  async handleEmailMessage(job: Job) {
    const { to, name, contact, email, message } = job.data;
    try {
      await this.mailService.sendMessageEmail(
        to,
        name,
        contact,
        email,
        message,
      );
    } catch (error) {
      throw new Error('Sending Email failed');
    }
  }
}
