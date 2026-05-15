import { Controller, Get, Param, Query, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { TerritoriosService } from './territorios.service';
import { GadTipo } from './entities/gad.entity';

@ApiTags('territorios')
@Controller('territorios')
export class TerritoriosController {
  constructor(private readonly svc: TerritoriosService) {}

  @Get('provincias')
  @ApiOperation({ summary: 'Lista de las 24 provincias del Ecuador' })
  provincias() {
    return this.svc.findAllProvincias();
  }

  @Get('provincias/buscar')
  @ApiQuery({ name: 'q', required: true })
  buscarProv(@Query('q') q: string) {
    return this.svc.searchProvincias(q);
  }

  @Get('provincias/:id')
  provincia(@Param('id', ParseIntPipe) id: number) {
    return this.svc.findProvinciaById(id);
  }

  @Get('cantones')
  @ApiOperation({ summary: 'Lista de cantones, filtrable por provincia' })
  @ApiQuery({ name: 'provinciaId', required: false, type: Number })
  cantones(@Query('provinciaId') provinciaId?: number) {
    return this.svc.findAllCantones(provinciaId ? Number(provinciaId) : undefined);
  }

  @Get('cantones/:id')
  canton(@Param('id', ParseIntPipe) id: number) {
    return this.svc.findCantonById(id);
  }

  @Get('gads')
  @ApiOperation({ summary: 'Lista de Gobiernos Autónomos Descentralizados (GAD)' })
  @ApiQuery({ name: 'tipo', required: false, enum: GadTipo })
  gads(@Query('tipo') tipo?: GadTipo) {
    return this.svc.findAllGads(tipo);
  }

  @Get('gads/buscar')
  @ApiQuery({ name: 'q', required: true })
  buscarGad(@Query('q') q: string) {
    return this.svc.searchGads(q);
  }

  @Get('gads/:id')
  gad(@Param('id', ParseIntPipe) id: number) {
    return this.svc.findGadById(id);
  }
}
