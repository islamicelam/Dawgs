import { PassportStrategy } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';
import { Strategy, Profile, VerifyCallback } from 'passport-google-oauth20';
import { AuthService } from './auth.service';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    config: ConfigService,
    private authService: AuthService,
  ) {
    super({
      clientID: config.getOrThrow<string>('GOOGLE_CLIENT_ID'),
      clientSecret: config.getOrThrow<string>('GOOGLE_CLIENT_SECRET'),
      callbackURL: config.getOrThrow<string>('GOOGLE_CALLBACK_URL'),
      scope: ['email', 'profile'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: VerifyCallback,
  ) {
    const email = profile.emails?.[0]?.value;
    if (!email) {
      return done(new Error('Email not found'));
    }
    const user = await this.authService.findOrCreateGoogleUser({ googleId: profile.id, email, name: profile.displayName });
    if (!user) {
      return done(new Error('User not found'));
    }
    return done(null, user);
  }
}
