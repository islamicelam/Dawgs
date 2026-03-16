import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { Controller, Post, Body } from '@nestjs/common';
import { Public } from './public.decorator';

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }
}
