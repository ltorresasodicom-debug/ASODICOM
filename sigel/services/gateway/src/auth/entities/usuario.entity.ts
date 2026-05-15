import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Rol } from './rol.entity';

@Entity({ name: 'usuarios', schema: 'sigel' })
export class Usuario {
  @PrimaryGeneratedColumn({ type: 'bigint' }) id: number;
  @Column({ type: 'uuid' }) uuid: string;
  @Column() email: string;
  @Column({ name: 'password_hash' }) passwordHash: string;
  @Column({ nullable: true }) nombre: string;
  @Column({ nullable: true }) apellido: string;
  @Column({ nullable: true }) cedula: string;
  @Column({ nullable: true }) telefono: string;
  @Column({ name: 'rol_id', type: 'bigint' }) rolId: number;
  @Column({ name: 'avatar_url', nullable: true }) avatarUrl: string;
  @Column({ name: 'provincia_id', type: 'bigint', nullable: true }) provinciaId: number;
  @Column({ name: 'canton_id', type: 'bigint', nullable: true }) cantonId: number;
  @Column({ name: 'email_verificado', default: false }) emailVerificado: boolean;
  @Column({ name: 'mfa_habilitado', default: false }) mfaHabilitado: boolean;
  @Column({ name: 'mfa_secret', nullable: true }) mfaSecret: string;
  @Column({ default: true }) activo: boolean;
  @Column({ name: 'ultimo_login', type: 'timestamptz', nullable: true }) ultimoLogin: Date;
  @CreateDateColumn({ name: 'created_at' }) createdAt: Date;
  @UpdateDateColumn({ name: 'updated_at' }) updatedAt: Date;

  @ManyToOne(() => Rol, { eager: true }) @JoinColumn({ name: 'rol_id' }) rol: Rol;
}
