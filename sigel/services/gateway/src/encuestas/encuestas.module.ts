import { Module, Controller, Get, Post, Body, Param, Injectable, ParseIntPipe } from '@nestjs/common';
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';
import { Repository } from 'typeorm';
import { TypeOrmModule, InjectRepository } from '@nestjs/typeorm';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { IsInt, Min, Max, IsOptional, IsString } from 'class-validator';

@Entity({ name: 'encuestas', schema: 'sigel' })
export class Encuesta {
  @PrimaryGeneratedColumn({ type: 'bigint' }) id: number;
  @Column() nombre: string;
  @Column({ nullable: true, type: 'text' }) descripcion: string;
  @Column() tipo: string;
  @Column({ name: 'fecha_inicio', type: 'date', nullable: true }) fechaInicio: Date;
  @Column({ name: 'fecha_fin', type: 'date', nullable: true }) fechaFin: Date;
  @Column({ default: true }) activa: boolean;
}

@Entity({ name: 'preguntas_encuesta', schema: 'sigel' })
export class Pregunta {
  @PrimaryGeneratedColumn({ type: 'bigint' }) id: number;
  @Column({ name: 'encuesta_id', type: 'bigint' }) encuestaId: number;
  @Column({ nullable: true }) codigo: string;
  @Column({ nullable: true }) bloque: string;
  @Column({ type: 'text' }) pregunta: string;
  @Column({ name: 'tipo_respuesta' }) tipoRespuesta: string;
  @Column({ default: true }) obligatoria: boolean;
  @Column({ nullable: true }) orden: number;
}

@Entity({ name: 'respuestas_ciudadanas', schema: 'sigel' })
export class Respuesta {
  @PrimaryGeneratedColumn({ type: 'bigint' }) id: number;
  @Column({ name: 'encuesta_id', type: 'bigint' }) encuestaId: number;
  @Column({ name: 'usuario_id', type: 'bigint', nullable: true }) usuarioId: number;
  @Column({ name: 'gad_id', type: 'bigint' }) gadId: number;
  @Column({ nullable: true }) confianza: number;
  @Column({ nullable: true }) transparencia: number;
  @Column({ nullable: true }) satisfaccion: number;
  @Column({ nullable: true }) participacion: number;
  @Column({ nullable: true }) corrupcion: number;
  @Column({ nullable: true }) servicios: number;
  @Column({ name: 'respuestas_detalle', type: 'jsonb', nullable: true }) respuestasDetalle: any;
  @Column({ nullable: true }) edad: number;
  @Column({ nullable: true }) sexo: string;
  @Column({ name: 'nivel_educativo', nullable: true }) nivelEducativo: string;
  @Column({ nullable: true }) zona: string;
  @Column({ nullable: true }) canal: string;
  @CreateDateColumn() fecha: Date;
}

export class CrearRespuestaDto {
  @IsInt() encuestaId: number;
  @IsInt() gadId: number;
  @IsInt() @Min(1) @Max(5) @IsOptional() confianza?: number;
  @IsInt() @Min(1) @Max(5) @IsOptional() transparencia?: number;
  @IsInt() @Min(1) @Max(5) @IsOptional() satisfaccion?: number;
  @IsInt() @Min(1) @Max(5) @IsOptional() participacion?: number;
  @IsInt() @Min(1) @Max(5) @IsOptional() corrupcion?: number;
  @IsInt() @Min(1) @Max(5) @IsOptional() servicios?: number;
  @IsOptional() respuestasDetalle?: any;
  @IsOptional() @IsInt() edad?: number;
  @IsOptional() @IsString() sexo?: string;
  @IsOptional() @IsString() nivelEducativo?: string;
  @IsOptional() @IsString() zona?: string;
  @IsOptional() @IsString() canal?: string;
}

@Injectable()
export class EncuestasService {
  constructor(
    @InjectRepository(Encuesta) private encuestas: Repository<Encuesta>,
    @InjectRepository(Pregunta) private preguntas: Repository<Pregunta>,
    @InjectRepository(Respuesta) private respuestas: Repository<Respuesta>,
  ) {}

  listar() {
    return this.encuestas.find({ where: { activa: true } });
  }

  obtenerPreguntas(encuestaId: number) {
    return this.preguntas.find({ where: { encuestaId }, order: { orden: 'ASC' } });
  }

  responder(dto: CrearRespuestaDto) {
    return this.respuestas.save(this.respuestas.create(dto as any));
  }

  percepcionPorGad(gadId: number) {
    return this.respuestas.query(
      `SELECT * FROM sigel.vw_percepcion_ciudadana WHERE gad_id = $1`,
      [gadId],
    );
  }
}

@ApiTags('encuestas')
@Controller('encuestas')
export class EncuestasController {
  constructor(private svc: EncuestasService) {}

  @Get()
  @ApiOperation({ summary: 'Encuestas activas' })
  listar() { return this.svc.listar(); }

  @Get(':id/preguntas')
  preguntas(@Param('id', ParseIntPipe) id: number) { return this.svc.obtenerPreguntas(id); }

  @Post('responder')
  @ApiOperation({ summary: 'Registrar respuesta ciudadana (Likert 1-5)' })
  @Throttle({ default: { limit: 3, ttl: 60_000 } })
  responder(@Body() dto: CrearRespuestaDto) { return this.svc.responder(dto); }

  @Get('percepcion/:gadId')
  percepcion(@Param('gadId', ParseIntPipe) gadId: number) {
    return this.svc.percepcionPorGad(gadId);
  }
}

@Module({
  imports: [TypeOrmModule.forFeature([Encuesta, Pregunta, Respuesta])],
  providers: [EncuestasService],
  controllers: [EncuestasController],
  exports: [EncuestasService],
})
export class EncuestasModule {}
