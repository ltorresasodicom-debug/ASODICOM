import { Module, Controller, Get, Query, Injectable, Param, ParseIntPipe } from '@nestjs/common';
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';
import { Repository } from 'typeorm';
import { TypeOrmModule, InjectRepository } from '@nestjs/typeorm';
import { ApiTags, ApiQuery, ApiOperation } from '@nestjs/swagger';

@Entity({ name: 'alertas', schema: 'sigel' })
export class Alerta {
  @PrimaryGeneratedColumn({ type: 'bigint' }) id: number;
  @Column({ type: 'uuid' }) uuid: string;
  @Column({ name: 'gad_id', type: 'bigint', nullable: true }) gadId: number;
  @Column() tipo: string;
  @Column() nivel: string;
  @Column() titulo: string;
  @Column({ type: 'text', nullable: true }) descripcion: string;
  @Column({ name: 'indicador_id', type: 'bigint', nullable: true }) indicadorId: number;
  @Column({ name: 'valor_observado', type: 'numeric', nullable: true }) valorObservado: number;
  @Column({ type: 'numeric', nullable: true }) umbral: number;
  @Column({ name: 'detectado_por', nullable: true }) detectadoPor: string;
  @Column({ type: 'jsonb', nullable: true }) metadata: any;
  @Column({ default: 'ACTIVA' }) estado: string;
  @Column({ default: false }) notificada: boolean;
  @CreateDateColumn() fecha: Date;
}

@Injectable()
export class AlertasService {
  constructor(@InjectRepository(Alerta) private repo: Repository<Alerta>) {}

  listar(nivel?: string, gadId?: number) {
    return this.repo.find({
      where: {
        ...(nivel ? { nivel } : {}),
        ...(gadId ? { gadId } : {}),
        estado: 'ACTIVA',
      },
      order: { fecha: 'DESC' },
      take: 200,
    });
  }

  porGad(gadId: number) {
    return this.repo.find({
      where: { gadId, estado: 'ACTIVA' },
      order: { fecha: 'DESC' },
    });
  }

  estadisticas() {
    return this.repo.query(`
      SELECT nivel, COUNT(*) AS total
      FROM sigel.alertas
      WHERE estado = 'ACTIVA'
      GROUP BY nivel
    `);
  }
}

@ApiTags('alertas')
@Controller('alertas')
export class AlertasController {
  constructor(private svc: AlertasService) {}

  @Get()
  @ApiOperation({ summary: 'Alertas activas del sistema' })
  @ApiQuery({ name: 'nivel', required: false })
  @ApiQuery({ name: 'gadId', required: false })
  listar(@Query('nivel') nivel?: string, @Query('gadId') gadId?: number) {
    return this.svc.listar(nivel, gadId ? Number(gadId) : undefined);
  }

  @Get('estadisticas')
  stats() {
    return this.svc.estadisticas();
  }

  @Get('gad/:gadId')
  porGad(@Param('gadId', ParseIntPipe) gadId: number) {
    return this.svc.porGad(gadId);
  }
}

@Module({
  imports: [TypeOrmModule.forFeature([Alerta])],
  providers: [AlertasService],
  controllers: [AlertasController],
  exports: [AlertasService],
})
export class AlertasModule {}
