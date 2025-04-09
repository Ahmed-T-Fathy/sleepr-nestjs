import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsersService } from '../users/users.service';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { TokenPayload } from '../token-payload.interface';
import { Injectable } from '@nestjs/common';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: any) => {
          console.log(`Request: ${JSON.stringify(req)}`);
          return (
            req?.cookies?.Authentication ||
            req?.Authentication ||
            req?.headers.Authentication
          );
        },
      ]),
      secretOrKey: configService.getOrThrow<string>('JWT_SECRET'),
    });
  }
  async validate(payload: TokenPayload) {
    console.log(`*****payload: ${JSON.stringify(payload)}`);
    const user = await this.usersService.getUser({ _id: payload.userId });
    console.log(`user: ${JSON.stringify(user)}`);
    return user;
  }
}
