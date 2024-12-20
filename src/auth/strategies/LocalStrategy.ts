import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService } from '../auth.service';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthPayloadDto } from '../dto/login.auth.dto';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({
      usernameField: 'email',
    });
  }

  async validate(email: string, password: string): Promise<any> {
    const result = await this.authService.validateUser(email, password);
    if (!result) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return result;
  }
}
