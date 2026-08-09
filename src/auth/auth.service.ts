import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import { UsersService } from '../users/users.service';

interface AuthResult {
  id: string;
  username: string;
  accessToken: string;
}

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async signUp(username: string, pass: string): Promise<AuthResult> {
    if (await this.usersService.findByName(username)) {
      throw new ConflictException('Username already taken');
    }
    const user = await this.usersService.create(
      username,
      await argon2.hash(pass),
    );

    return {
      id: user.id,
      username: user.username,
      accessToken: await this.jwtService.signAsync({ sub: user.id, username }),
    };
  }

  async signIn(username: string, pass: string): Promise<AuthResult> {
    const user = await this.usersService.findByName(username);
    if (!user || !(await argon2.verify(user.passwordHash, pass))) {
      throw new UnauthorizedException();
    }
    await this.jwtService.signAsync({ sub: user.id, username });
    return {
      id: user.id,
      username: user.username,
      accessToken: await this.jwtService.signAsync({ sub: user.id, username }),
    };
  }
}
