import { Controller, Post, Body, Get, UseGuards, Request, Res, Session } from '@nestjs/common';
import { UserService } from '@src/user/user.service';
import { UserRequestDto } from '@src/user/dto/user.request.dto';
import { EmailRequestDto } from '@src/email/dto/email.request.dto';
import { UserVerifyDto } from '@src/user/dto/user.verify.dto';
import { ApiTags, ApiOperation, ApiBody, ApiResponse} from '@nestjs/swagger'
import { LocalAuthGuard } from '@src/auth/guard/local.guard';
import { RefreshGuard } from '@src/auth/guard/refresh.guard';
import { UserLoginDto } from '@src/user/dto/user.login.dto';
import { JwtAuthGuard } from '@src/auth/guard/jwt.guard';
import { ApiGuard } from '@src/auth/guard/api.guard';


@Controller('user')
@ApiTags('user') 
export class UserController {
    constructor(private readonly userService: UserService) {}

    @UseGuards(ApiGuard)
    @Get()
    @ApiOperation({ summary: 'Find Every Users Info', description: 'get every users information for test environment' })
    @ApiResponse({ status: 200, description: 'Success' })    
    @ApiResponse({ status: 400, description: 'Request without API KEY' })    
    @ApiResponse({ status: 403, description: 'Invalid API KEY' })    
    @ApiResponse({ status: 501, description: 'Server Error' })
    async findAll() {
        return await this.userService.findAll();
    }

    @UseGuards(JwtAuthGuard)
	@Get('profile')
    @ApiOperation({ summary: 'Get user info', description: 'get profile information from accessToken inserted in cookies' })
    @ApiResponse({ status: 200, description: 'Success' })
    @ApiResponse({ status: 401, description: 'Empty / Invalid token' })    
    @ApiResponse({ status: 410, description: 'Token has expired' })        
	async getProfile(@Request() req) {
		return req.user;
	}

    @UseGuards(ApiGuard)
    @Post()
    @ApiOperation({ summary: 'Add new user', description: 'create new user data in server database' })
    @ApiBody({ type: UserRequestDto })
    @ApiResponse({ status: 201, description: 'Success' })
    @ApiResponse({ status: 400, description: 'Request without API KEY' })    
    @ApiResponse({ status: 403, description: 'Invalid API KEY' })    
    @ApiResponse({ status: 408, description: 'Not verified or time expired' })    
    @ApiResponse({ status: 409, description: 'The user already exists' })
    @ApiResponse({ status: 501, description: 'Server Error' })
    async signUp(@Body() body: UserRequestDto) {
        return await this.userService.signUp(body);
    }

    @UseGuards(ApiGuard)
    @Post('email')
    @ApiOperation({ summary: 'Send verification email', description: 'send a verifcation email which would be 6digits for <email> value as the target' })
    @ApiBody({ type: EmailRequestDto })
    @ApiResponse({ status: 201, description: 'Success' })
    @ApiResponse({ status: 400, description: 'Request without API KEY' })    
    @ApiResponse({ status: 403, description: 'Invalid API KEY' })
    @ApiResponse({ status: 501, description: 'Server Error' })
    async sendVerification(@Body() body: EmailRequestDto) {
        return await this.userService.sendVerification(body);
    }

    @UseGuards(ApiGuard)
    @Post('verify')
    @ApiOperation({ summary: 'Verify digit code', description: 'Check if the verificationCode value is same with the code server sent and cached for limited time' })
    @ApiBody({ type: UserVerifyDto })
    @ApiResponse({ status: 201, description: 'Success' })
    @ApiResponse({ status: 400, description: 'Request without API KEY' })    
    @ApiResponse({ status: 403, description: 'Invalid API KEY' })    
    @ApiResponse({ status: 401, description: 'Invalid code' })
    @ApiResponse({ status: 408, description: 'Not sent or time expired' })    
    @ApiResponse({ status: 501, description: 'Server Error' })
    async verify(@Body() body: UserVerifyDto) {
        return await this.userService.verify(body);
    }

    @UseGuards(LocalAuthGuard)
	@Post('login')
    @ApiOperation({ summary: 'Login', description: 'Login with body information including e-mail and password and issue accessToken if request would be validate.' })
    @ApiBody({ type: UserLoginDto })
    @ApiResponse({ status: 201, description: 'Success' })
    @ApiResponse({ status: 401, description: 'Invalid e-mail or password' })    
	async login(@Request() req, @Res({ passthrough: true}) response) {
		const accessToken = req.user.access;
        const refreshToken = req.user.refresh;
        response.cookie('access_token', accessToken, { httpOnly: true });
        response.cookie('refresh_token', refreshToken, { httpOnly: true });
		return "success";
	}    

    @UseGuards(RefreshGuard)
	@Post('refresh')
    @ApiOperation({ summary: 'Refresh', description: 'Refresh access token in case previous access token is expired.' })
    @ApiResponse({ status: 201, description: 'Success' })
    @ApiResponse({ status: 401, description: 'Invalid refresh token' })    
	async refresh(@Request() req, @Res({ passthrough: true}) response) {
		const accessToken = req.user.access;
        const refreshToken = req.user.refresh;
        response.cookie('access_token', accessToken, { httpOnly: true });
        response.cookie('refresh_token', refreshToken, { httpOnly: true });
		return "success";
	}        

    @Post('logout')
    @ApiResponse({ status: 201, description: 'Success' })
    async logout(@Res({ passthrough: true}) response) {
        response.clearCookie('access_token');
        response.clearCookie('refresh_token');
        return "success";
    }    
}    