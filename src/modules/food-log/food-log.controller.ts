import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Request,
  Delete,
  Param, ValidationPipe, UsePipes, Query, Patch,
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
import { UpdateFoodLogDto } from './dto/UpdateFoodLogDto';

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
  @Roles(Role.ADMIN)
  async findAll(
    @Query() pagination: PageOptionsDto): Promise<PageDto<FoodLog>>{
    return this.foodLogService.findAll(pagination);
  }

  @Get('search')
  @UseGuards(AuthGuard('jwt'))
  @ApiQuery({name: 'name', required: true })
  @ApiQuery({name: 'page', required: false })
  @ApiQuery({name: 'limit', required: false })
  @Roles(Role.ADMIN)
  findByName(
    @Query() pageOptions: PageOptionsDto,
    @Request() req,
  ){
      return this.foodLogService.findByName(pageOptions, req.user);
  }

  @Patch(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @ApiOperation({ summary: 'Actualizar registro de comida' })
  @ApiResponse({ status: 200, description: 'Registro de comida actualizado exitosamente' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Acceso prohibido - Requiere rol ADMIN' })
  @ApiResponse({ status: 404, description: 'Registro de comida no encontrado' })
  @ApiResponse({ status: 409, description: 'Registro de comida ya existe' })
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  @Roles(Role.ADMIN)
  update(
    @Param('id') id: string,
    @Body() dto: UpdateFoodLogDto,
    @Request() req
  ){
    return this.foodLogService.update(id, dto, req.user);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @ApiOperation({ summary: 'Eliminar registro de comida' })
  @ApiResponse({ status: 200, description: 'Registro de comida eliminado exitosamente' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Acceso prohibido - Requiere rol ADMIN' })
  @ApiResponse({ status: 404, description: 'Registro de comida no encontrado' })
  @ApiResponse({ status: 409, description: 'Registro de comida ya existe' })
  @Roles(Role.ADMIN)
  delete(
    @Param('id') id: string,
    @Request() req
  ){
    return this.foodLogService.delete(id, req.user);
  }

}
