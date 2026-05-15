import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ObjectType, Field, ID, Int, Float, registerEnumType } from '@nestjs/graphql';

export enum CargoAutoridad {
  ALCALDE = 'ALCALDE',
  PREFECTO = 'PREFECTO',
  VICEALCALDE = 'VICEALCALDE',
  VICEPREFECTO = 'VICEPREFECTO',
  CONCEJAL = 'CONCEJAL',
  ASAMBLEISTA = 'ASAMBLEISTA',
}
registerEnumType(CargoAutoridad, { name: 'CargoAutoridad' });

@ObjectType()
@Entity({ name: 'autoridades', schema: 'sigel' })
export class Autoridad {
  @Field(() => ID) @PrimaryGeneratedColumn({ type: 'bigint' }) id: number;
  @Field() @Column({ type: 'uuid' }) uuid: string;
  @Field() @Column({ name: 'nombre_completo' }) nombreCompleto: string;
  @Field(() => CargoAutoridad) @Column({ type: 'varchar' }) cargo: CargoAutoridad;
  @Field(() => Int, { nullable: true }) @Column({ name: 'gad_id', type: 'bigint', nullable: true }) gadId: number;
  @Field(() => Int, { nullable: true }) @Column({ name: 'provincia_id', type: 'bigint', nullable: true }) provinciaId: number;
  @Field(() => Int, { nullable: true }) @Column({ name: 'canton_id', type: 'bigint', nullable: true }) cantonId: number;
  @Field(() => Int, { nullable: true }) @Column({ name: 'partido_id', type: 'bigint', nullable: true }) partidoId: number;
  @Field() @Column({ default: false }) alianza: boolean;
  @Field({ nullable: true }) @Column({ nullable: true, type: 'text' }) coalicion: string;
  @Field(() => Float, { nullable: true }) @Column({ name: 'porcentaje_votos', type: 'numeric', nullable: true }) porcentajeVotos: number;
  @Field({ nullable: true }) @Column({ name: 'periodo_inicio', type: 'date', nullable: true }) periodoInicio: Date;
  @Field({ nullable: true }) @Column({ name: 'periodo_fin', type: 'date', nullable: true }) periodoFin: Date;
  @Field({ nullable: true }) @Column({ nullable: true, type: 'text' }) biografia: string;
  @Field({ nullable: true }) @Column({ name: 'foto_url', nullable: true, type: 'text' }) fotoUrl: string;
  @Field({ nullable: true }) @Column({ nullable: true }) twitter: string;
  @Field({ nullable: true }) @Column({ nullable: true }) instagram: string;
  @Field({ nullable: true }) @Column({ nullable: true }) facebook: string;
  @Field({ nullable: true }) @Column({ nullable: true }) linkedin: string;
  @Field({ nullable: true }) @Column({ nullable: true }) email: string;
  @Field({ nullable: true }) @Column({ nullable: true }) telefono: string;
  @Field() @Column({ default: true }) activo: boolean;
  @Field() @CreateDateColumn({ name: 'created_at' }) createdAt: Date;
  @Field() @UpdateDateColumn({ name: 'updated_at' }) updatedAt: Date;
}
