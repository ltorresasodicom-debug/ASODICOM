import { Module, Controller, Get, Param, Injectable, ParseIntPipe } from '@nestjs/common';
import { TypeOrmModule, InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@Entity({ name: 'dimensiones', schema: 'sigel' })
export class Dimension {
  @PrimaryGeneratedColumn({ type: 'bigint' }) id: number;
  @Column() codigo: string;
  @Column() nombre: string;
  @Column({ nullable: true, type: 'text' }) descripcion: string;
  @Column({ type: 'numeric' }) ponderacion: number;
  @Column({ name: 'color_hex', nullable: true }) colorHex: string;
  @Column({ nullable: true }) icono: string;
  @Column({ nullable: true }) orden: number;
}

@Entity({ name: 'variables', schema: 'sigel' })
export class Variable {
  @PrimaryGeneratedColumn({ type: 'bigint' }) id: number;
  @Column({ name: 'dimension_id', type: 'bigint' }) dimensionId: number;
  @Column() codigo: string;
  @Column() nombre: string;
  @Column({ nullable: true, type: 'text' }) descripcion: string;
  @Column({ type: 'numeric' }) peso: number;
  @Column({ nullable: true }) orden: number;
}

@Entity({ name: 'indicadores', schema: 'sigel' })
export class Indicador {
  @PrimaryGeneratedColumn({ type: 'bigint' }) id: number;
  @Column({ name: 'variable_id', type: 'bigint' }) variableId: number;
  @Column() codigo: string;
  @Column() nombre: string;
  @Column({ nullable: true, type: 'text' }) descripcion: string;
  @Column() tipo: string;
  @Column({ nullable: true }) unidad: string;
  @Column({ nullable: true, type: 'text' }) formula: string;
  @Column({ type: 'numeric' }) peso: number;
  @Column({ nullable: true }) fuente: string;
  @Column({ nullable: true }) frecuencia: string;
}

@Injectable()
export class IndicadoresService {
  constructor(
    @InjectRepository(Dimension) private dims: Repository<Dimension>,
    @InjectRepository(Variable) private vars: Repository<Variable>,
    @InjectRepository(Indicador) private inds: Repository<Indicador>,
  ) {}

  findDimensiones() {
    return this.dims.find({ order: { orden: 'ASC' } });
  }
  findVariables(dimensionId?: number) {
    return this.vars.find({
      where: dimensionId ? { dimensionId } : {},
      order: { orden: 'ASC' },
    });
  }
  findIndicadores(variableId?: number) {
    return this.inds.find({ where: variableId ? { variableId } : {} });
  }
  findIndicador(id: number) {
    return this.inds.findOne({ where: { id } });
  }
}

@ApiTags('indicadores')
@Controller('indicadores')
export class IndicadoresController {
  constructor(private svc: IndicadoresService) {}

  @Get('dimensiones')
  @ApiOperation({ summary: 'Catálogo de 8 dimensiones SIGEL con ponderaciones' })
  dimensiones() {
    return this.svc.findDimensiones();
  }

  @Get('variables')
  variables() {
    return this.svc.findVariables();
  }

  @Get('catalogo')
  catalogo() {
    return this.svc.findIndicadores();
  }

  @Get(':id')
  one(@Param('id', ParseIntPipe) id: number) {
    return this.svc.findIndicador(id);
  }
}

@Module({
  imports: [TypeOrmModule.forFeature([Dimension, Variable, Indicador])],
  providers: [IndicadoresService],
  controllers: [IndicadoresController],
  exports: [IndicadoresService],
})
export class IndicadoresModule {}
