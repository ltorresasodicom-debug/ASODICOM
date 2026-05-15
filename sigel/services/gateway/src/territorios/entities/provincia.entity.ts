import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ObjectType, Field, ID, Int, Float } from '@nestjs/graphql';
import { Canton } from './canton.entity';

@ObjectType()
@Entity({ name: 'provincias', schema: 'sigel' })
export class Provincia {
  @Field(() => ID) @PrimaryGeneratedColumn({ type: 'bigint' }) id: number;
  @Field() @Column({ type: 'uuid' }) uuid: string;
  @Field({ nullable: true }) @Column({ name: 'codigo_ine', nullable: true }) codigoIne: string;
  @Field() @Column() nombre: string;
  @Field(() => Int, { nullable: true }) @Column({ name: 'region_id', type: 'bigint', nullable: true }) regionId: number;
  @Field(() => Int, { nullable: true }) @Column({ nullable: true }) poblacion: number;
  @Field(() => Float, { nullable: true }) @Column({ name: 'superficie_km2', type: 'numeric', nullable: true }) superficieKm2: number;
  @Field({ nullable: true }) @Column({ nullable: true }) capital: string;
  @Field({ nullable: true }) @Column({ type: 'geometry', nullable: true }) centroide: any;
  @Field() @CreateDateColumn({ name: 'created_at' }) createdAt: Date;
  @Field() @UpdateDateColumn({ name: 'updated_at' }) updatedAt: Date;

  @OneToMany(() => Canton, (canton) => canton.provincia) cantones: Canton[];
}
