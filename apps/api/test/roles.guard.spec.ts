import 'reflect-metadata';
import { describe, expect, it } from 'vitest';
import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '@prisma/client';
import { ROLES_KEY } from '../src/common/decorators/roles.decorator';
import { RolesGuard } from '../src/common/guards/roles.guard';

function contextFor(role?: Role): ExecutionContext {
  const handler = () => undefined;
  Reflect.defineMetadata(ROLES_KEY, [Role.SUPER_ADMIN, Role.STORE_ADMIN], handler);

  return {
    getHandler: () => handler,
    getClass: () => class TestController {},
    switchToHttp: () => ({
      getRequest: () => ({ user: role ? { role } : undefined }),
    }),
  } as ExecutionContext;
}

describe('RolesGuard', () => {
  const guard = new RolesGuard(new Reflector());

  it('allows a user with an explicitly required role', () => {
    expect(guard.canActivate(contextFor(Role.STORE_ADMIN))).toBe(true);
  });

  it('rejects users without a required role', () => {
    expect(() => guard.canActivate(contextFor(Role.CUSTOMER))).toThrow(ForbiddenException);
    expect(() => guard.canActivate(contextFor())).toThrow(ForbiddenException);
  });
});
