import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '../../users/role.enum';
import { ROLES_KEY } from './roles.decorator';


@Injectable()
export class RolesGuard implements CanActivate{

  constructor(private reflector: Reflector) {}

/*  canActivate(ctx: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      ctx.getHandler(),
      ctx.getClass(),
    ]);
    if (!required || required.length === 0) return true;


    const { user } = ctx.switchToHttp().getRequest();
    if (!user || !user.role) return false;

    // Comparación case-insensitive para evitar problemas de mayúsculas/minúsculas
    const userRole = String(user.role).toLowerCase();
    const requiredNormalized = required.map(r => String(r).toLowerCase());

    return requiredNormalized.includes(userRole);

    // return required.includes(user.role);
  }*/
  canActivate(ctx: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      ctx.getHandler(),
      ctx.getClass(),
    ]);
    if (!required || required.length === 0) return true;

    const { user } = ctx.switchToHttp().getRequest();
    if (!user) return false;

    // Normaliza: lee `roles` (array) o cae a `role` (string)
    const userRoles = (user.roles ?? (user.role ? [user.role] : []))
      .map((r: string) => String(r).toLowerCase());

    const requiredNormalized = required.map(r => String(r).toLowerCase());
    return requiredNormalized.some(r => userRoles.includes(r));
  }
}