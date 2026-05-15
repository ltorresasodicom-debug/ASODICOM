import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Controller, Get, Param, ParseIntPipe, Query, Injectable } from '@nestjs/common';
import { Repository, ILike } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { ApiTags, ApiQuery, ApiOperation } from '@nestjs/swagger';
import { Autoridad, CargoAutoridad } from './entities/autoridad.entity';

@Injectable()
export class AutoridadesService {
  constructor(@InjectRepository(Autoridad) private repo: Repository<Autoridad>) {}

  async findAll(cargo?: CargoAutoridad, provinciaId?: number) {
    return this.repo.find({
      where: {
        ...(cargo ? { cargo } : {}),
        ...(provinciaId ? { provinciaId } : {}),
        activo: true,
      },
      order: { nombreCompleto: 'ASC' },
      take: 500,
    });
  }

  async findById(id: number) {
    return this.repo.findOne({ where: { id } });
  }

  async search(q: string) {
    return this.repo.find({
      where: { nombreCompleto: ILike(`%${q}%`), activo: true },
      take: 30,
    });
  }
}

@ApiTags('autoridades')
@Controller('autoridades')
export class AutoridadesController {
  constructor(private readonly svc: AutoridadesService) {}

  @Get()
  @ApiOperation({ summary: 'Lista paginada de autoridades (alcaldes, prefectos, asambleístas)' })
  @ApiQuery({ name: 'cargo', required: false, enum: CargoAutoridad })
  @ApiQuery({ name: 'provinciaId', required: false, type: Number })
  list(@Query('cargo') cargo?: CargoAutoridad, @Query('provinciaId') provinciaId?: number) {
    return this.svc.findAll(cargo, provinciaId ? Number(provinciaId) : undefined);
  }

  @Get('buscar')
  buscar(@Query('q') q: string) {
    return this.svc.search(q);
  }

  @Get(':id')
  one(@Param('id', ParseIntPipe) id: number) {
    return this.svc.findById(id);
  }
}

@Module({
  imports: [TypeOrmModule.forFeature([Autoridad])],
  providers: [AutoridadesService],
  controllers: [AutoridadesController],
  exports: [AutoridadesService],
})
export class AutoridadesModule {}
