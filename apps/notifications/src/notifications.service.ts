import { Injectable } from '@nestjs/common';
import { NotifyEmailDto } from './dto/notify-email.dto';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class NotificationsService {
  constructor(private readonly configService: ConfigService) {}

  private readonly transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      type: 'OAuth2',
      user: this.configService.getOrThrow<string>('SMTP_USER'),
      clientId: this.configService.getOrThrow<string>('GOOGLE_OAUTH_CLIENT_ID'),
      clientSecret: this.configService.getOrThrow<string>(
        'GOOGLE_OAUTH_CLIENT_SECRET',
      ),
      refreshToken: this.configService.getOrThrow<string>(
        'GOOGLE_OAUTH_REFRESH_TOKEN',
      ),
    },
  });
  async notifyEmail(data: NotifyEmailDto) {
    return `email sent to ${data.email} with subject ${data.subject} and body ${data.body}`;
  }
}
