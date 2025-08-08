  import { createParamDecorator, ExecutionContext, UnauthorizedException } from '@nestjs/common';
  import { UserInfo } from '../../modules/food-log/entities/UserInfo';


  export const UserInfoDecorator = createParamDecorator(
    (data: keyof UserInfo | undefined, ctx: ExecutionContext) => {
      const req = ctx.switchToHttp().getRequest();
      const user = req.user as UserInfo | undefined;
      if(!user) throw new UnauthorizedException('Usuario no autenticado');
      return data ? user[data] : user;
    },
  )