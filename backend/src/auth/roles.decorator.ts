import { SetMetadata } from '@nestjs/common';
import { UserRole } from './roles';

/**
 * Ключ, под которым роли будут храниться в metadata
 * (используется RolesGuard)
 */
export const ROLES_KEY = 'roles';

/**
 * Roles(...)
 *
 * Декоратор для ограничения доступа к эндпоинту по ролям.
 *
 * Пример:
 * @Roles('ADMIN')
 * @Roles('ADMIN', 'Manage')
 *
 * Эти роли сохраняются в metadata метода / контроллера.
 */
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
