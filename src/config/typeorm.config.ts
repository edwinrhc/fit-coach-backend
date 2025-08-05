import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { join } from 'path';

export const typeOrmConfig: TypeOrmModuleOptions = {
  type: 'mysql',
  host: process.env.DB_HOST || 'localhost',
  port: +process.env.DB_PORT || 3306,
  username: process.env.DB_USER || 'root',
  password: process.env.DB_PASS || '123456',
  database: process.env.DB_NAME || 'fit_backend_ia',
  entities: [join(__dirname, '/../**/*.entity{.ts,.js}')],
  // entities:[Account,User],
  //TODO: Importante
  synchronize: true, // Sólo en desarrollo
  dropSchema: true,
  autoLoadEntities: true, // Carga automáticamente las entidades registradas
};
