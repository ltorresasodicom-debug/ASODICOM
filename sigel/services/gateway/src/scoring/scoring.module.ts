import { Module, Controller, Get, Post, Query, Param, Body, Injectable, ParseIntPipe, Inject } from '@nestjs/common';
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { Repository } from 'typeorm';
import { TypeOrmModule, InjectRepository } from '@nestjs/typeorm';
import { HttpModule, HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { CACHE_MANAGER, CacheModule } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { firstValueFrom } from 'rxjs';
import { ApiTags, ApiQuery, ApiOperation } from '@nestjs/swagger';

@Entity({ name: 'scoring', schema: 'sigel' })
export class Scoring {
  @PrimaryGeneratedColumn({ type: 'bigint' }) id: number;
  @Column({ type: 'uuid' }) uuid: string;
  @Column({ name: 'gad_id', type: 'bigint' }) gadId: number;
  @Column({ name: 'fecha_corte', type: 'date' }) fechaCorte: Date;
  @Column({ type: 'numeric' }) ingel: number;
  @Column({ type: 'numeric', nullable: true }) transparencia: number;
  @Column({ type: 'numeric', nullable: true }) finanzas: number;
  @Column({ type: 'numeric', nullable: true }) servicios: number;
  @Column({ type: 'numeric', nullable: true }) desarrollo: number;
  @Column({ name: 'gestion_institucional', type: 'numeric', nullable: true }) gestionInstitucional: number;
  @Column({ type: 'numeric', nullable: true }) participacion: number;
  @Column({ type: 'numeric', nullable: true }) legitimidad: number;
  @Column({ type: 'numeric', nullable: true }) innovacion: number;
  @Column({ type: 'numeric', nullable: true }) iri: number;
  @Column({ type: 'numeric', nullable: true }) itd: number;
  @Column({ type: 'numeric', nullable: true }) icdl: number;
  @Column({ name: 'nivel_desempeno', nullable: true }) nivelDesempeno: string;
  @Column({ nullable: true }) semaforo: string;
  @Column({ name: 'ranking_nacional', nullable: true }) rankingNacional: number;
  @Column({ name: 'ranking_provincial', nullable: true }) rankingProvincial: number;
  @Column({ name: 'ranking_cluster', nullable: true }) rankingCluster: number;
}

@Injectable()
export class ScoringService {
  constructor(
    @InjectRepository(Scoring) private repo: Repository<Scoring>,
    private http: HttpService,
    private cfg: ConfigService,
    @Inject(CACHE_MANAGER) private cache: Cache,
  ) {}

  async actual(gadId: number) {
    return this.repo
      .createQueryBuilder('s')
      .where('s.gad_id = :gadId', { gadId })
      .orderBy('s.fecha_corte', 'DESC')
      .getOne();
  }

  async rankingNacional(limit = 50, offset = 0) {
    const key = `ranking:nacional:${limit}:${offset}`;
    const cached = await this.cache.get(key);
    if (cached) return cached;
    const result = await this.repo.query(
      `SELECT * FROM sigel.vw_ranking_nacional LIMIT $1 OFFSET $2`,
      [limit, offset],
    );
    await this.cache.set(key, result, 300_000);
    return result;
  }

  async rankingProvincial(provincia: string) {
    return this.repo.query(
      `SELECT * FROM sigel.vw_ranking_provincial WHERE provincia = $1 ORDER BY posicion_provincia ASC`,
      [provincia],
    );
  }

  async evolucion(gadId: number) {
    return this.repo.query(
      `SELECT fecha_corte, ingel, transparencia, finanzas, servicios, participacion, legitimidad
       FROM sigel.vw_evolucion_historica WHERE gad_id = $1 ORDER BY fecha_corte ASC`,
      [gadId],
    );
  }

  async estadisticasNacionales() {
    const cached = await this.cache.get('estadisticas:nacionales');
    if (cached) return cached;
    const [stats] = await this.repo.query(`SELECT * FROM sigel.vw_estadisticas_nacionales`);
    await this.cache.set('estadisticas:nacionales', stats, 300_000);
    return stats;
  }

  /** Solicita al microservicio analytics el recálculo del INGEL para un GAD. */
  async recalcular(gadId: number) {
    const url = `${this.cfg.get<string>('app.analyticsUrl')}/api/v1/scoring/calcular/${gadId}`;
    const { data } = await firstValueFrom(this.http.post(url));
    await this.cache.del(`ranking:nacional:50:0`);
    return data;
  }
}

@ApiTags('scoring')
@Controller('scoring')
export class ScoringController {
  constructor(private svc: ScoringService) {}

  @Get('estadisticas')
  @ApiOperation({ summary: 'Estadísticas nacionales agregadas del INGEL' })
  stats() {
    return this.svc.estadisticasNacionales();
  }

  @Get('ranking/nacional')
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'offset', required: false })
  rankingNacional(@Query('limit') l = 50, @Query('offset') o = 0) {
    return this.svc.rankingNacional(Number(l), Number(o));
  }

  @Get('ranking/provincial/:provincia')
  rankingProv(@Param('provincia') prov: string) {
    return this.svc.rankingProvincial(prov);
  }

  @Get('gad/:id')
  scoringActual(@Param('id', ParseIntPipe) id: number) {
    return this.svc.actual(id);
  }

  @Get('gad/:id/evolucion')
  evolucion(@Param('id', ParseIntPipe) id: number) {
    return this.svc.evolucion(id);
  }

  @Post('gad/:id/recalcular')
  @ApiOperation({ summary: 'Solicita recálculo del INGEL (delegado a analytics)' })
  recalcular(@Param('id', ParseIntPipe) id: number) {
    return this.svc.recalcular(id);
  }
}

@Module({
  imports: [TypeOrmModule.forFeature([Scoring]), HttpModule, CacheModule.register()],
  providers: [ScoringService],
  controllers: [ScoringController],
  exports: [ScoringService],
})
export class ScoringModule {}
