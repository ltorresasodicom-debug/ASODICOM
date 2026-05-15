import { Module, Controller, Get, Post, Body, Param, Injectable, ParseIntPipe } from '@nestjs/common';
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Repository } from 'typeorm';
import { TypeOrmModule, InjectRepository } from '@nestjs/typeorm';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { IsInt, IsString, IsOptional, IsBoolean } from 'class-validator';

@Entity({ name: 'denuncias', schema: 'sigel' })
export class Denuncia {
  @PrimaryGeneratedColumn({ type: 'bigint' }) id: number;
  @Column({ type: 'uuid' }) uuid: string;
  @Column({ name: 'codigo_publico' }) codigoPublico: string;
  @Column({ name: 'usuario_id', type: 'bigint', nullable: true }) usuarioId: number;
  @Column({ name: 'gad_id', type: 'bigint' }) gadId: number;
  @Column({ name: 'autoridad_id', type: 'bigint', nullable: true }) autoridadId: number;
  @Column() tipo: string;
  @Column() asunto: string;
  @Column({ type: 'text' }) descripcion: string;
  @Column({ type: 'jsonb', nullable: true }) evidencias: any;
  @Column({ default: 'NUEVA' }) estado: string;
  @Column({ nullable: true }) prioridad: string;
  @Column({ default: false }) anonima: boolean;
  @Column({ name: 'riesgo_score', type: 'numeric', nullable: true }) riesgoScore: number;
  @Column({ name: 'clasificacion_ia', type: 'jsonb', nullable: true }) clasificacionIa: any;
  @CreateDateColumn({ name: 'created_at' }) createdAt: Date;
  @UpdateDateColumn({ name: 'updated_at' }) updatedAt: Date;
}

export class CrearDenunciaDto {
  @IsInt() gadId: number;
  @IsOptional() @IsInt() autoridadId?: number;
  @IsString() tipo: string;
  @IsString() asunto: string;
  @IsString() descripcion: string;
  @IsOptional() evidencias?: any;
  @IsOptional() @IsBoolean() anonima?: boolean;
}

@Injectable()
export class DenunciasService {
  constructor(@InjectRepository(Denuncia) private repo: Repository<Denuncia>) {}

  private generarCodigo() {
    return 'SIGEL-' + Math.random().toString(36).slice(2, 10).toUpperCase();
  }

  async crear(dto: CrearDenunciaDto, usuarioId?: number) {
    const den = this.repo.create({
      ...dto,
      anonima: dto.anonima ?? false,
      codigoPublico: this.generarCodigo(),
      usuarioId: dto.anonima ? undefined : usuarioId,
      estado: 'NUEVA',
    });
    return this.repo.save(den);
  }

  buscarPorCodigo(codigo: string) {
    return this.repo.findOne({ where: { codigoPublico: codigo } });
  }

  porGad(gadId: number) {
    return this.repo.find({
      where: { gadId },
      order: { createdAt: 'DESC' },
      take: 100,
    });
  }
}

@ApiTags('denuncias')
@Controller('denuncias')
export class DenunciasController {
  constructor(private svc: DenunciasService) {}

  @Post()
  @ApiOperation({ summary: 'Registrar denuncia ciudadana (puede ser anónima)' })
  crear(@Body() dto: CrearDenunciaDto) {
    return this.svc.crear(dto);
  }

  @Get('codigo/:codigo')
  porCodigo(@Param('codigo') codigo: string) {
    return this.svc.buscarPorCodigo(codigo);
  }

  @Get('gad/:gadId')
  porGad(@Param('gadId', ParseIntPipe) gadId: number) {
    return this.svc.porGad(gadId);
  }
}

@Module({
  imports: [TypeOrmModule.forFeature([Denuncia])],
  providers: [DenunciasService],
  controllers: [DenunciasController],
})
export class DenunciasModule {}
