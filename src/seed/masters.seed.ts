import { AppModule } from '../app.module';
import { NestFactory } from '@nestjs/core';
import { DataSource } from 'typeorm';
import { User } from '../modules/users/entities/user.entity';
import { Role } from '../modules/users/role.enum';
import * as bcrypt from 'bcryptjs';

async function mastersSeed(){

  const app = await NestFactory.createApplicationContext(AppModule);
  const dataSource = app.get(DataSource);

  // Limpia la base de datos
  await dataSource.synchronize(true);

  const userRepo = dataSource.getRepository(User);

  const users: Partial<User>[] =  [];

  for (let i = 1; i <= 10; i++){
    users.push({
      username: `user${i}`,
      email: `users${i}@correo.com`,
      password: await bcrypt.hash('123456', 10),
      role: Role.USER,
    })
  }

  const adminUser = userRepo.create({
    username: 'admin',
    email: 'edwinrhc@gmail.com',
    password: await bcrypt.hash('123456', 10),
    role: Role.ADMIN
  });

  await userRepo.save(adminUser);

  console.log('✅ Seed master completado con usuarios');
  await app.close();
}

mastersSeed().catch((err) => {
  console.error('❌ Error en seed master:', err);
  process.exit(1);
})