import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { mergeMap } from 'rxjs/operators';
import { Role } from '@prisma/client';
import { AuditService } from '../../modules/audit/audit.service';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(private readonly auditService: AuditService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<{
      method: string;
      baseUrl?: string;
      path: string;
      route?: { path?: string };
      user?: { id?: string; role?: Role };
      ip?: string;
      headers: Record<string, string | string[] | undefined>;
    }>();
    const { method, user, ip, headers } = request;
    const routePath = typeof request.route?.path === 'string'
      ? `${request.baseUrl ?? ''}${request.route.path}`
      : request.path;
    const action = `${method} ${routePath}`.slice(0, 100);

    // Only audit state-modifying requests (POST, PUT, PATCH, DELETE)
    const isStateModifying = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method);
    if (!isStateModifying || routePath.includes('/health')) {
      return next.handle();
    }

    return next.handle().pipe(
      mergeMap(async (result) => {
        await this.auditService.log({
          userId: user?.id,
          userRole: user?.role,
          action,
          ipAddress: ip,
          userAgent: headers['user-agent'] as string,
        });
        return result;
      })
    );
  }
}
