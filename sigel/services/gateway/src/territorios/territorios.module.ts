import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Provincia } from './entities/provincia.entity';
import { Canton } from './entities/canton.entity';
import { Gad } from './entities/gad.entity';
import { TerritoriosService } from './territorios.service';
import { TerritoriosController } from './territorios.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Provincia, Canton, Gad])],
  providers: [TerritoriosService],
  controllers: [TerritoriosController],
  exports: [TerritoriosService],
})
export class TerritoriosModule {}
