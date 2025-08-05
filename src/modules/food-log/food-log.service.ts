import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { FoodLog } from './entities/foodLog.entity';
import { User } from '../users/entities/user.entity';
import { CreateFoodLogDto } from './dto/CreateFoodLogDto';
import { InjectRepository } from '@nestjs/typeorm';
import { UserInfo } from './entities/UserInfo';
import { PageOptionsDto } from '../../common/page/page-options.dto';
import { PageDto } from '../../common/page/page.dto';
import { UpdateFoodLogDto } from './dto/UpdateFoodLogDto';

@Injectable()
export class FoodLogService {

  constructor(
    @InjectRepository(FoodLog)
    private repo: Repository<FoodLog>,

    @InjectRepository(User)
    private userRepo: Repository<User>
  ) {}

  async create(dto: CreateFoodLogDto, userInfo: UserInfo): Promise<FoodLog>{
    try{
      const user = await this.userRepo.findOne({
        where: { id: userInfo.userId }
      });

      if(!user){
        throw new NotFoundException('Usuario no encontrado');
      }

      const food = this.repo.create({
        ...dto,
        eatenAt: new Date(),
        createdBy: user,
        createdById: user.id,
        updatedBy: user,
        updatedById: user.id,
      });
      return await this.repo.save(food);
    } catch(error){
      if (error instanceof NotFoundException) throw error;
      throw new  InternalServerErrorException('Error al crear el log de alimentos');
    }
  }

  async findByName(
    pageOptions: PageOptionsDto,
    userInfo: UserInfo
  ): Promise<PageDto<FoodLog>>{

    const { page, limit, filter } = pageOptions;

    const qb = this.repo.createQueryBuilder('foodLog')
      .where('LOWER(foodLog.name) LIKE LOWER(:name)', { name: `%${filter}%` })
      .andWhere('foodLog.createdById = :userId', { userId: userInfo.userId })
      .orderBy('foodLog.eatenAt', 'DESC')
      .skip((page -1 ) * limit)
      .take(limit);

    const [items, totalItems] = await qb.getManyAndCount();

    return new PageDto<FoodLog>(items, totalItems, { page, limit});
  }



  // async update(id: string, dto: UpdateFoodLogDto, userInfo: UserInfo): Promise<FoodLog>{
  //   try{
  //     const foodLog = await this.repo.findOne(id,userInfo);
  //
  //   }catch(error){
  //     if( error instanceof NotFoundException) throw error;
  //     throw new InternalServerErrorException('Error al actualizar el log de alimentos');
  //   }
  // }



  async findAll(pageOptions: PageOptionsDto): Promise<PageDto<FoodLog>>{
    const { page, limit, filter} = pageOptions;

    const qb = this.repo.createQueryBuilder('foodLog')
      .where('LOWER(foodLog.name) LIKE LOWER(:filter)', { filter: `%${filter}%` })
      .skip((page - 1) * limit)
      .take(limit);

    const [items, totalItems] = await qb.getManyAndCount();
    return new PageDto<FoodLog>(items,totalItems, { page, limit});
  }

}
