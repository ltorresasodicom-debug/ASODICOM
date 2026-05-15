import { Module, Controller, Get, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Usuario } from '../auth/entities/usuario.entity';
import { Rol } from '../auth/entities/rol.entity';

@ApiTags('users')
@Controller('users')
export class UsersController {
  @Get('me')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  me(@Req() req: any) {
    return req.user;
  }
}

@Module({
  imports: [TypeOrmModule.forFeature([Usuario, Rol])],
  controllers: [UsersController],
})
export class UsersModule {}
