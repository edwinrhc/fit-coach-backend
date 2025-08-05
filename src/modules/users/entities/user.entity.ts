import { ApiProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
import {
  Column,
  CreateDateColumn,
  Entity, OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Role } from '../role.enum';
import { FoodLog } from '../../food-log/entities/foodLog.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    example: 'usuario123',
    description: 'Nombre de usuario único',
  })
  @IsString()
  @IsNotEmpty()
  @Column({ unique: true })
  username: string;

  @ApiProperty({ example: 'correo@ejemplo.com', description: 'Email válido' })
  @IsEmail()
  @IsNotEmpty()
  @Column({
    length: 100,
    unique: true,
  })
  email: string;

  @ApiProperty({
    example: 'secreto123',
    description: 'Contraseña (mínimo 6 caracteres)',
  })
  @IsString()
  @Exclude()
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  @Column()
  password: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'enum', enum: Role, default: Role.USER })
  role: Role;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;

  // @OneToMany(() => FoodLog, foodLog => foodLog.user)
  // foodLogs: FoodLog[];
}
