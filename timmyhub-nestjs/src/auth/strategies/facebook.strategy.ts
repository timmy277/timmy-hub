/**
 * Facebook OAuth Strategy cho Passport.js
 * Xử lý xác thực người dùng qua tài khoản Facebook
 */
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile } from 'passport-facebook';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../auth.service';

type FacebookVerifyCallback = (error: Error | null, user?: Express.User, info?: object) => void;

@Injectable()
export class FacebookStrategy extends PassportStrategy(Strategy, 'facebook') {
    constructor(
        private readonly configService: ConfigService,
        private readonly authService: AuthService,
    ) {
        super({
            clientID: configService.getOrThrow<string>('FACEBOOK_APP_ID'),
            clientSecret: configService.getOrThrow<string>('FACEBOOK_APP_SECRET'),
            callbackURL: configService.getOrThrow<string>('FACEBOOK_CALLBACK_URL'),
            scope: ['email'],
            profileFields: ['id', 'emails', 'name', 'picture.type(large)'],
        });
    }

    async validate(
        _accessToken: string,
        _refreshToken: string,
        profile: Profile,
        done: FacebookVerifyCallback,
    ): Promise<void> {
        const { id, emails, name, photos } = profile;
        const email = emails?.[0]?.value;

        if (!email) {
            done(
                new Error(
                    'Không lấy được email từ Facebook. Vui lòng đảm bảo tài khoản Facebook có email.',
                ),
            );
            return;
        }

        try {
            const user = await this.authService.findOrCreateOAuthUser({
                provider: 'facebook',
                providerId: id,
                email,
                firstName: name?.givenName ?? '',
                lastName: name?.familyName ?? '',
                avatar: photos?.[0]?.value,
            });
            done(null, user);
        } catch (error) {
            done(error as Error);
        }
    }
}
