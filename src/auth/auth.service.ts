import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async signUp(
    username: string,
    pass: string,
  ): Promise<{ accessToken: string }> {
    if (await this.usersService.findByName(username)) {
      throw new ConflictException('Username already taken');
    }
    const user = await this.usersService.create(
      username,
      await argon2.hash(pass),
    );
    return this.issueToken(user.id, user.username);
  }

  async signIn(
    username: string,
    pass: string,
  ): Promise<{ accessToken: string }> {
    const user = await this.usersService.findByName(username);
    if (!user || !(await argon2.verify(user.passwordHash, pass))) {
      throw new UnauthorizedException();
    }
    return this.issueToken(user.id, user.username);
  }

  private async issueToken(sub: string, username: string) {
    return {
      accessToken: await this.jwtService.signAsync({ sub, username }),
    };
  }
}
