import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import * as argon2 from 'argon2';
import * as crypto from 'crypto';
import { authenticator } from 'otplib';
import * as qrcode from 'qrcode';
import { Usuario } from './entities/usuario.entity';
import { Rol } from './entities/rol.entity';
import { Sesion } from './entities/sesion.entity';

export interface JwtPayload {
  sub: number;
  email: string;
  rol: string;
  permisos: string[];
}

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Usuario) private users: Repository<Usuario>,
    @InjectRepository(Rol) private roles: Repository<Rol>,
    @InjectRepository(Sesion) private sesiones: Repository<Sesion>,
    private jwt: JwtService,
    private cfg: ConfigService,
  ) {}

  async register(email: string, password: string, nombre?: string) {
    const exists = await this.users.findOne({ where: { email } });
    if (exists) throw new ConflictException('Email ya registrado');
    const rol = await this.roles.findOne({ where: { codigo: 'CIUDADANO' } });
    if (!rol) throw new BadRequestException('Rol CIUDADANO no encontrado');
    const passwordHash = await argon2.hash(password, { type: argon2.argon2id });
    const user = this.users.create({ email, passwordHash, nombre, rolId: rol.id });
    return this.users.save(user);
  }

  async validateUser(email: string, password: string): Promise<Usuario | null> {
    const user = await this.users.findOne({ where: { email }, relations: { rol: true } });
    if (!user || !user.activo) return null;
    const ok = await argon2.verify(user.passwordHash, password);
    return ok ? user : null;
  }

  async login(user: Usuario, mfaToken?: string, ip?: string, userAgent?: string) {
    if (user.mfaHabilitado) {
      if (!mfaToken) throw new UnauthorizedException('MFA requerido');
      const valid = authenticator.check(mfaToken, user.mfaSecret);
      if (!valid) throw new UnauthorizedException('Token MFA inválido');
    }
    const payload: JwtPayload = {
      sub: Number(user.id),
      email: user.email,
      rol: user.rol.codigo,
      permisos: user.rol.permisos as unknown as string[],
    };
    const accessToken = this.jwt.sign(payload);
    const refreshToken = crypto.randomBytes(48).toString('base64url');
    const refreshHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
    const expiresAt = new Date(Date.now() + 7 * 24 * 3600 * 1000);

    await this.sesiones.save(
      this.sesiones.create({
        usuarioId: Number(user.id),
        refreshTokenHash: refreshHash,
        expiresAt,
        ip,
        userAgent,
      }),
    );

    await this.users.update(user.id, { ultimoLogin: new Date() });

    return {
      accessToken,
      refreshToken,
      tokenType: 'Bearer',
      expiresIn: 900,
      user: {
        id: user.id,
        email: user.email,
        nombre: user.nombre,
        rol: user.rol.codigo,
      },
    };
  }

  async refresh(refreshToken: string) {
    const hash = crypto.createHash('sha256').update(refreshToken).digest('hex');
    const sesion = await this.sesiones.findOne({
      where: { refreshTokenHash: hash, revoked: false },
    });
    if (!sesion || sesion.expiresAt < new Date()) {
      throw new UnauthorizedException('Refresh token inválido');
    }
    const user = await this.users.findOne({
      where: { id: sesion.usuarioId },
      relations: { rol: true },
    });
    if (!user) throw new UnauthorizedException();
    const payload: JwtPayload = {
      sub: Number(user.id),
      email: user.email,
      rol: user.rol.codigo,
      permisos: user.rol.permisos as unknown as string[],
    };
    return { accessToken: this.jwt.sign(payload), tokenType: 'Bearer', expiresIn: 900 };
  }

  async logout(refreshToken: string) {
    const hash = crypto.createHash('sha256').update(refreshToken).digest('hex');
    await this.sesiones.update({ refreshTokenHash: hash }, { revoked: true });
    return { ok: true };
  }

  async enableMfa(userId: number) {
    const user = await this.users.findOneOrFail({ where: { id: userId } });
    const secret = authenticator.generateSecret();
    const otpauth = authenticator.keyuri(user.email, 'SIGEL Ecuador', secret);
    const qr = await qrcode.toDataURL(otpauth);
    await this.users.update(userId, { mfaSecret: secret });
    return { secret, qr };
  }

  async confirmMfa(userId: number, token: string) {
    const user = await this.users.findOneOrFail({ where: { id: userId } });
    if (!user.mfaSecret) throw new BadRequestException('MFA no iniciado');
    if (!authenticator.check(token, user.mfaSecret)) {
      throw new UnauthorizedException('Token inválido');
    }
    await this.users.update(userId, { mfaHabilitado: true });
    return { ok: true };
  }
}
