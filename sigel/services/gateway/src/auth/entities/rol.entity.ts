import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity({ name: 'roles', schema: 'sigel' })
export class Rol {
  @PrimaryGeneratedColumn({ type: 'bigint' }) id: number;
  @Column() codigo: string;
  @Column() nombre: string;
  @Column({ nullable: true, type: 'text' }) descripcion: string;
  @Column({ type: 'jsonb', default: '[]' }) permisos: string[];
}
