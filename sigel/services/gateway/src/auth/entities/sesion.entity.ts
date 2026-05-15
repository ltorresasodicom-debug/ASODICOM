import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity({ name: 'sesiones_jwt', schema: 'sigel' })
export class Sesion {
  @PrimaryGeneratedColumn({ type: 'bigint' }) id: number;
  @Column({ name: 'usuario_id', type: 'bigint' }) usuarioId: number;
  @Column({ name: 'refresh_token_hash', type: 'text' }) refreshTokenHash: string;
  @Column({ type: 'inet', nullable: true }) ip: string;
  @Column({ name: 'user_agent', type: 'text', nullable: true }) userAgent: string;
  @Column({ name: 'expires_at', type: 'timestamptz' }) expiresAt: Date;
  @Column({ default: false }) revoked: boolean;
  @CreateDateColumn({ name: 'created_at' }) createdAt: Date;
}
