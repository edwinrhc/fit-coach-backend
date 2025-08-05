import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Request,
  Delete,
  Param, ValidationPipe, UsePipes, Query,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles/roles.guard';
import { FoodLogService } from './food-log.service';
import { CreateFoodLogDto } from './dto/CreateFoodLogDto';
import { Role } from '../users/role.enum';
import { Roles } from '../auth/roles/roles.decorator';
import { ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { FoodLog } from './entities/foodLog.entity';
import { UserInfo } from './entities/UserInfo';
import { PageOptionsDto } from 'src/common/page/page-options.dto';
import { PageDto } from '../../common/page/page.dto';

@Controller('food-log')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class FoodLogController {
  constructor(private readonly foodLogService: FoodLogService) {}

  @Post('register')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.ADMIN)
  @ApiResponse({
    status: 201,
    description: 'Entrada de comida creada exitosamente',
    type: FoodLog
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Acceso prohibido - Requiere rol ADMIN' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async create(
    @Body() dto: CreateFoodLogDto,
    @Request() req: { user: UserInfo}) {
    return  this.foodLogService.create(dto, req.user);
  }

  @Get('list')
  @ApiOperation({ summary: 'Listar todos los registros de comida' })
  @ApiResponse({ status: 200, description: 'Lista de registros de comida' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Acceso prohibido - Requiere rol ADMIN' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  async findAll(
    @Query() pagination: PageOptionsDto): Promise<PageDto<FoodLog>>{
    return this.foodLogService.findAll(pagination);
  }

  @Get('search')
  @UseGuards(AuthGuard('jwt'))
  @ApiQuery({name: 'name', required: true })
  @ApiQuery({name: 'page', required: false })
  @ApiQuery({name: 'limit', required: false })
  findByName(
    @Query() pageOptions: PageOptionsDto,
    @Request() req,
  ){
      return this.foodLogService.findByName(pageOptions, req.user);
  }


}
