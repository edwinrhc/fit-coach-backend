import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';


@Entity('email_verifications')
@Unique(['token'])
export class EmailVerification  {

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({length: 200})
  token: string; // un uuid aleatorio seguro

  @Column({ type: 'timestamp' })
  expiresAt: Date;

  @Column({ default: false })
  used: boolean;

  @ManyToOne( () => User, { eager: true, onDelete: 'CASCADE'})
  user: User;

  @CreateDateColumn({ type: 'timestamp'})
  createdAt: Date;



}
