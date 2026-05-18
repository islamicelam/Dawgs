import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { Controller, Post, Body, Get, Request, Res, Req, UnauthorizedException } from '@nestjs/common';
import { Public } from './public.decorator';
import { Request as ExpressRequest, Response } from 'express';

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  private setCookies(res: Response, tokens: { access_token: string; refresh_token: string }) {
    const isProd = process.env.NODE_ENV === 'production';
    const base = { httpOnly: true, secure: isProd, sameSite: 'lax' as const, path: '/' };
    res.cookie('access_token', tokens.access_token, { ...base, maxAge: 15 * 60 * 1000 });
    res.cookie('refresh_token', tokens.refresh_token, { ...base, maxAge: 30 * 24 * 60 * 60 * 1000 });
  }

  @Public()
  @Post('login')
  async login(@Body() loginDto: LoginDto, @Res({ passthrough: true }) res: Response) {
    const tokens = await this.authService.login(loginDto);
    this.setCookies(res, tokens);
    return { message: 'OK' };
  }

  @Public()
  @Post('refresh')
  async refresh(@Req() req: ExpressRequest, @Res({ passthrough: true }) res: Response) {
    const refreshToken = (req.cookies as Record<string, string>)?.refresh_token;
    if (!refreshToken) throw new UnauthorizedException('No refresh token');
    const tokens = await this.authService.refresh(refreshToken);
    this.setCookies(res, tokens);
    return { message: 'OK' };
  }

  @Post('logout')
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('access_token', { path: '/' });
    res.clearCookie('refresh_token', { path: '/' });
    return { message: 'OK' };
  }

  @Get('me')
  me(@Request() req) {
    return req.user;
  }
}
