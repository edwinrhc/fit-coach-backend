import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from "bcryptjs";
import { PageOptionsDto } from '../../common/page/page-options.dto';
import { PageDto } from '../../common/page/page.dto';


@Injectable()
export class UsersService {

  constructor(
    @InjectRepository(User)
    private repo: Repository<User>
  ) {
  }

  async create(dto: CreateUserDto): Promise<User>{

    const existing = await this.repo.findOne({ where: { username: dto.username } });
    if(existing){
      throw new BadRequestException('El nombre de usuario ya existe');
    }

    const existingEmail = await this.repo.findOne({ where: { email: dto.email } });
    if(existingEmail){
      throw new BadRequestException('El correo ya se encuentra en uso');
    }

    const hash = await bcrypt.hash(dto.password, 10);
    const user = this.repo.create({
      username: dto.username,
      email: dto.email,
      password: hash
    });

    try{
      return await this.repo.save(user);
    }catch (error: any){
      const code = error.code ?? error.errno ?? error.name;
      throw new BadRequestException(code + 'El nombre de usuario ya está en uso');
    }
  }

  async findByUsername(username: string): Promise<User>{
    const user = await this.repo.findOne({ where: { username}});
    if(!user) throw new NotFoundException(`Usuario ${username} no encontrado`);
    return user;
  }
  
  async findAll(pageOptions: PageOptionsDto): Promise<PageDto<User>>{
    const { page, limit, filter } = pageOptions;
    const qb = this.repo.createQueryBuilder('user')
      .where('LOWER(user.username) LIKE LOWER(:filter)', { filter: `%${filter}%` })
      .orderBy('user.username', 'ASC')
      .skip((page - 1) * limit)
      .take(limit);

    const [items, totalItems] = await qb.getManyAndCount();
    return new PageDto<User>(items,totalItems, { page, limit});

  }




}
