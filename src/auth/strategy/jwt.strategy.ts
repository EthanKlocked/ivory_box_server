import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
	constructor(
		private readonly configService: ConfigService
	){
		super({
            jwtFromRequest: ExtractJwt.fromExtractors([
                (request: any) => {
                    const token = (request && request.cookies) ? request.cookies['Authorization'] : null;
                    return token;
                },
            ]),
			ignoreExpiration: false,
			secretOrKey: configService.get<string>("JWT_SECRET"),
		});
	}
	
	async validate(payload: any) {
		return { id: payload.sub, mail: payload.userName };
	}
}