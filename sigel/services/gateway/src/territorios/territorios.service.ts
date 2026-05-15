import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { Provincia } from './entities/provincia.entity';
import { Canton } from './entities/canton.entity';
import { Gad, GadTipo } from './entities/gad.entity';

@Injectable()
export class TerritoriosService {
  constructor(
    @InjectRepository(Provincia) private provs: Repository<Provincia>,
    @InjectRepository(Canton) private cants: Repository<Canton>,
    @InjectRepository(Gad) private gads: Repository<Gad>,
  ) {}

  findAllProvincias() {
    return this.provs.find({ order: { nombre: 'ASC' } });
  }

  findProvinciaById(id: number) {
    return this.provs.findOne({ where: { id }, relations: { cantones: true } });
  }

  searchProvincias(query: string) {
    return this.provs.find({
      where: { nombre: ILike(`%${query}%`) },
      take: 20,
      order: { nombre: 'ASC' },
    });
  }

  findAllCantones(provinciaId?: number) {
    return this.cants.find({
      where: provinciaId ? { provinciaId } : {},
      relations: { provincia: true },
      order: { nombre: 'ASC' },
    });
  }

  findCantonById(id: number) {
    return this.cants.findOne({ where: { id }, relations: { provincia: true } });
  }

  findAllGads(tipo?: GadTipo) {
    return this.gads.find({
      where: tipo ? { tipo } : {},
      relations: { provincia: true, canton: true },
      order: { nombre: 'ASC' },
    });
  }

  findGadById(id: number) {
    return this.gads.findOne({
      where: { id },
      relations: { provincia: true, canton: true },
    });
  }

  searchGads(query: string) {
    return this.gads.find({
      where: { nombre: ILike(`%${query}%`) },
      take: 50,
      relations: { provincia: true, canton: true },
    });
  }
}
