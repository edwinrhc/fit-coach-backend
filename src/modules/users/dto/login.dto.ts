import { IsNotEmpty, IsString, Max, MaxLength, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({example: 'admin'})
  @IsString({ message: 'El nombre de usuario debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El nombre de usuario no puede estar vacío' })
  @MinLength(4)
  @MaxLength(20)
  username: string;

  @ApiProperty({ example: 'secreto123', minLength: 6})
  @IsString({ message: 'La contraseña debe ser texto' })
  @IsNotEmpty({ message: 'La contraseña no puede estar vacía' })
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  @MaxLength(20,{ message: 'La contraseña debe tener máximo 20 caracteres' })
  password: string;
}
