import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles/roles.guard';
import { UsersService } from './services/users.service';
import { PageOptionsDto } from '../../common/page/page-options.dto';
import { Roles } from '../auth/roles/roles.decorator';
import { Role } from './role.enum';
import { PageDto } from '../../common/page/page.dto';
import { User } from './entities/user.entity';

@ApiTags('users')
@ApiBearerAuth()
@Controller('users')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class UsersController {
  constructor(private readonly service: UsersService) {}

  @Get('list')
  @Roles(Role.ADMIN, Role.USER)
  @ApiOperation({ summary: 'Listar todos los usuarios' })
  @ApiResponse({ status: 200, description: 'Lista de usuarios' })
  findAll(@Query() pageOptions: PageOptionsDto): Promise<PageDto<User>> {
    return this.service.findAll(pageOptions);
  }

  @Get(':profile')
  @Roles(Role.ADMIN, Role.USER)
  @ApiOperation({ summary: 'Encontrar usuario' })
  @ApiParam({ name: 'profile', description: 'Nombre de usuario' })
  @ApiResponse({ status: 200, description: 'Usuario encontrado' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  findOne(@Param('profile') profile: string) {
    return this.service.findByUsername(profile);
  }
}
