import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let code = 'INTERNAL_SERVER_ERROR';
    let details: string[] | null = null;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse();

      if (typeof res === 'string') {
        message = res;
        code = HttpStatus[status] || 'HTTP_ERROR';
      } else if (typeof res === 'object' && res !== null) {
        const resObj = res as { message?: unknown; error?: unknown; code?: unknown };
        if (typeof resObj.message === 'string') {
          message = resObj.message;
        } else if (Array.isArray(resObj.message)) {
          details = resObj.message.filter((item): item is string => typeof item === 'string');
          message = details[0] || exception.message;
        } else {
          message = exception.message;
        }
        code = typeof resObj.code === 'string'
          ? resObj.code
          : typeof resObj.error === 'string'
            ? resObj.error
            : HttpStatus[status] || 'HTTP_ERROR';
      }
    } else if (exception instanceof Error) {
      this.logger.error('Unhandled exception', exception.stack);
    }

    const errorResponse = {
      success: false,
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      error: {
        code,
        message: Array.isArray(message) ? message[0] : message,
        details,
      },
    };

    response.status(status).json(errorResponse);
  }
}
