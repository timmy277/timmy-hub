import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback, Profile } from 'passport-google-oauth20';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../auth.service';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
    constructor(
        private readonly configService: ConfigService,
        private readonly authService: AuthService,
    ) {
        super({
            clientID: configService.getOrThrow<string>('GOOGLE_CLIENT_ID'),
            clientSecret: configService.getOrThrow<string>('GOOGLE_CLIENT_SECRET'),
            callbackURL: configService.getOrThrow<string>('GOOGLE_CALLBACK_URL'),
            scope: ['email', 'profile'],
        });
    }

    async validate(
        _accessToken: string,
        _refreshToken: string,
        profile: Profile,
        done: VerifyCallback,
    ): Promise<void> {
        const { id, emails, name, photos } = profile;
        const email = emails?.[0]?.value;

        if (!email) {
            done(new Error('Không lấy được email từ Google account'), undefined);
            return;
        }

        try {
            const user = await this.authService.findOrCreateOAuthUser({
                provider: 'google',
                providerId: id,
                email,
                firstName: name?.givenName ?? '',
                lastName: name?.familyName ?? '',
                avatar: photos?.[0]?.value,
            });
            done(null, user);
        } catch (error) {
            done(error as Error, undefined);
        }
    }
}
