import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor() {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: 'MA_KHOA_BIMAT_123', // Khóa này phải khớp y hệt khóa trong auth.module.ts
        });
    }

    async validate(payload: any) {
        return { userId: payload.sub, email: payload.email };
    }
}