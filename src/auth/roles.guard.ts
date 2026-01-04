import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from './roles.decorator';
import { UserRole } from './roles';

/**
 * RolesGuard
 *
 * Guard, который:
 * 1. Читает роли из @Roles(...)
 * 2. Берёт user из request (его кладёт туда JWT AuthGuard)
 * 3. Проверяет, есть ли у пользователя нужная роль
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Получаем роли, указанные в @Roles() у метода или контроллера
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    // Если роли не указаны — доступ открыт
    if (!requiredRoles) {
      return true;
    }

    // Получаем request и пользователя
    const request = context.switchToHttp().getRequest<{
      user?: {
        id: number;
        role: UserRole;
      };
    }>();
    const user = request.user;

    // Если пользователь не авторизован — доступ запрещён
    if (!user || !user.role) {
      return false;
    }

    // Проверяем, совпадает ли роль пользователя с разрешёнными
    return requiredRoles.includes(user.role);
  }
}
