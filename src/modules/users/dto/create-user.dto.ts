import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';
import { Match } from '../../../common/validators/match.decorator';
import { Role } from '../role.enum';

export class CreateUserDto {
  @ApiProperty({ example: 'usuario123' })
  @IsString({ message: 'El nombre de usuario debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El nombre de usuario no puede estar vacío' })
  @MinLength(4)
  @MaxLength(20)
  username: string;

  @ApiProperty({ example: 'correo@ejemplo.com' })
  @IsEmail({}, { message: 'Debe ser un correo electrónico válido' })
  @IsNotEmpty({ message: 'El correo no puede estar vacío' })
  email: string;

  @ApiProperty({ example: 'secreto123', minLength: 6 })
  @IsString({ message: 'La contraseña debe ser una cadena de texto' })


  password: string;


  @ApiProperty({ example: 'secreto123', description: 'Repite la contraseña para confirmarla' })
  @IsString()
  @IsNotEmpty({message:'La confirmación de contraseña no puede estar vacía'})
  @Match('password',{
    message: 'La contraseña y la confirmación debe coincidir'
  })
  confirmPassword: string;

  @IsEnum(Role)
  @IsNotEmpty()
  role: Role;

}
