import { Body, Controller, Post, Req, UseGuards, Get } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { LoginDto, RegisterDto, RefreshDto, MfaConfirmDto } from './dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Registro de ciudadano' })
  register(@Body() dto: RegisterDto) {
    return this.auth.register(dto.email, dto.password, dto.nombre);
  }

  @Post('login')
  @ApiOperation({ summary: 'Login con email/password (+ MFA si está habilitado)' })
  async login(@Body() dto: LoginDto, @Req() req: any) {
    const user = await this.auth.validateUser(dto.email, dto.password);
    if (!user) return { error: 'Credenciales inválidas' };
    return this.auth.login(user, dto.mfaToken, req.ip, req.headers['user-agent']);
  }

  @Post('refresh')
  refresh(@Body() dto: RefreshDto) {
    return this.auth.refresh(dto.refreshToken);
  }

  @Post('logout')
  logout(@Body() dto: RefreshDto) {
    return this.auth.logout(dto.refreshToken);
  }

  @Post('mfa/enable')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  enableMfa(@Req() req: any) {
    return this.auth.enableMfa(req.user.sub);
  }

  @Post('mfa/confirm')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  confirmMfa(@Req() req: any, @Body() dto: MfaConfirmDto) {
    return this.auth.confirmMfa(req.user.sub, dto.token);
  }

  @Get('me')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  me(@Req() req: any) {
    return req.user;
  }
}
