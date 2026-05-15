import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { ObjectType, Field, ID, Int, Float } from '@nestjs/graphql';
import { Provincia } from './provincia.entity';

@ObjectType()
@Entity({ name: 'cantones', schema: 'sigel' })
export class Canton {
  @Field(() => ID) @PrimaryGeneratedColumn({ type: 'bigint' }) id: number;
  @Field() @Column({ type: 'uuid' }) uuid: string;
  @Field(() => Int) @Column({ name: 'provincia_id', type: 'bigint' }) provinciaId: number;
  @Field() @Column() nombre: string;
  @Field(() => Int, { nullable: true }) @Column({ nullable: true }) poblacion: number;
  @Field(() => Float, { nullable: true }) @Column({ name: 'superficie_km2', type: 'numeric', nullable: true }) superficieKm2: number;
  @Field(() => Float, { nullable: true }) @Column({ nullable: true, type: 'numeric' }) presupuesto: number;
  @Field({ nullable: true }) @Column({ nullable: true }) categoria: string;
  @Field(() => Float, { nullable: true }) @Column({ name: 'indice_pobreza', type: 'numeric', nullable: true }) indicePobreza: number;
  @Field(() => Float, { nullable: true }) @Column({ name: 'ruralidad_pct', type: 'numeric', nullable: true }) ruralidadPct: number;

  @ManyToOne(() => Provincia, (p) => p.cantones, { eager: false })
  @JoinColumn({ name: 'provincia_id' })
  provincia: Provincia;
}
