import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ObjectType, Field, ID, Int, Float, registerEnumType } from '@nestjs/graphql';
import { Provincia } from './provincia.entity';
import { Canton } from './canton.entity';

export enum GadTipo {
  MUNICIPAL = 'MUNICIPAL',
  PROVINCIAL = 'PROVINCIAL',
  PARROQUIAL = 'PARROQUIAL',
}
registerEnumType(GadTipo, { name: 'GadTipo' });

@ObjectType()
@Entity({ name: 'gads', schema: 'sigel' })
export class Gad {
  @Field(() => ID) @PrimaryGeneratedColumn({ type: 'bigint' }) id: number;
  @Field() @Column({ type: 'uuid' }) uuid: string;
  @Field(() => GadTipo) @Column({ type: 'varchar' }) tipo: GadTipo;
  @Field() @Column() nombre: string;
  @Field(() => Int, { nullable: true }) @Column({ name: 'provincia_id', type: 'bigint', nullable: true }) provinciaId: number;
  @Field(() => Int, { nullable: true }) @Column({ name: 'canton_id', type: 'bigint', nullable: true }) cantonId: number;
  @Field({ nullable: true }) @Column({ name: 'sitio_web', nullable: true }) sitioWeb: string;
  @Field({ nullable: true }) @Column({ name: 'portal_transparencia', nullable: true }) portalTransparencia: string;
  @Field({ nullable: true }) @Column({ nullable: true }) email: string;
  @Field({ nullable: true }) @Column({ nullable: true }) telefono: string;
  @Field(() => Float, { nullable: true }) @Column({ name: 'presupuesto_anual', type: 'numeric', nullable: true }) presupuestoAnual: number;
  @Field(() => Int, { nullable: true }) @Column({ nullable: true }) empleados: number;
  @Field() @Column({ default: true }) activo: boolean;
  @Field() @CreateDateColumn({ name: 'created_at' }) createdAt: Date;
  @Field() @UpdateDateColumn({ name: 'updated_at' }) updatedAt: Date;

  @ManyToOne(() => Provincia, { eager: false }) @JoinColumn({ name: 'provincia_id' }) provincia: Provincia;
  @ManyToOne(() => Canton, { eager: false }) @JoinColumn({ name: 'canton_id' }) canton: Canton;
}
