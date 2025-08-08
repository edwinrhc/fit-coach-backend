import { User } from '../../users/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity, JoinColumn, ManyToOne,
  PrimaryGeneratedColumn, UpdateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';


@Entity('food_logs')
export class FoodLog {

  @PrimaryGeneratedColumn('uuid')
  id:string;

  @Column()
  name:string;

  @Column({type: 'float'})
  calories:number;

  @Column({ type: 'float', default: 0, nullable: false })
  protein: number;

  @Column({nullable: true})
  notes?:string;

  @CreateDateColumn({ type: 'timestamp'})
  eatenAt: Date;


  @CreateDateColumn({ type: 'timestamp'})
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp'})
  updatedAt: Date;

  // @ManyToOne( () => User,user => user.foodLogs,{ eager: false})
  // @JoinColumn({ name: 'createdById' })
  // user: User;

  // *Relación al usuario que creó*
  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'createdById' })
  createdBy: User;

  @Column('uuid')
  createdById: string;

  // *Relación al usuario que actualizó*
  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'updatedById' })
  updatedBy?: User;
  @Column('uuid', { nullable: true })
  updatedById?: string;


}