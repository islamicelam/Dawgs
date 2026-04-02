import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/users.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  private async signTokens(user: User) {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    };
    const access_token = this.jwtService.sign(payload);
    const refresh_token = this.jwtService.sign(payload, {
      secret:
        this.configService.get<string>('JWT_REFRESH_SECRET') ??
        this.configService.get<string>('JWT_SECRET'),
      expiresIn: '30d',
    });
    return { access_token, refresh_token };
  }

  async login(userDto: LoginDto): Promise<{ access_token: string; refresh_token: string }> {
    const user = await this.userRepo.findOne({
      where: { email: userDto.email },
    });
    if (!user || !(await bcrypt.compare(userDto.password, user.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const tokens = await this.signTokens(user);
    const refreshTokenHash = await bcrypt.hash(tokens.refresh_token, 10);
    await this.userRepo.save({ ...user, refreshTokenHash });
    return {
      ...tokens,
    };
  }

  async refresh(refreshToken: string): Promise<{ access_token: string; refresh_token: string }> {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret:
          this.configService.get<string>('JWT_REFRESH_SECRET') ??
          this.configService.get<string>('JWT_SECRET'),
      });
      const user = await this.userRepo.findOneBy({ id: payload.sub });
      if (!user || !user.refreshTokenHash) {
        throw new UnauthorizedException('Refresh token invalid');
      }
      const isValid = await bcrypt.compare(refreshToken, user.refreshTokenHash);
      if (!isValid) throw new UnauthorizedException('Refresh token invalid');
      const tokens = await this.signTokens(user);
      user.refreshTokenHash = await bcrypt.hash(tokens.refresh_token, 10);
      await this.userRepo.save(user);
      return tokens;
    } catch {
      throw new UnauthorizedException('Refresh token invalid');
    }
  }
}
