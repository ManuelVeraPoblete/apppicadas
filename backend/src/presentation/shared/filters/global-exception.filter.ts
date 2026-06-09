import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import {
  PlaceNotFoundException,
  UserNotFoundException,
  ReviewNotFoundException,
  UnauthorizedDomainException,
  DuplicateResourceException,
} from '../../../core/domain/exceptions/domain.exceptions';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Error interno del servidor';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else {
        const raw = (exceptionResponse as any).message;
        message = Array.isArray(raw) ? raw.join(', ') : raw || message;
      }
    } else if (
      exception instanceof PlaceNotFoundException ||
      exception instanceof UserNotFoundException ||
      exception instanceof ReviewNotFoundException
    ) {
      status = HttpStatus.NOT_FOUND;
      message = (exception as Error).message;
    } else if (exception instanceof UnauthorizedDomainException) {
      status = HttpStatus.FORBIDDEN;
      message = (exception as Error).message;
    } else if (exception instanceof DuplicateResourceException) {
      status = HttpStatus.CONFLICT;
      message = (exception as Error).message;
    }

    // Log de errores 500 para rastreo
    if (status === HttpStatus.INTERNAL_SERVER_ERROR) {
      const detail =
        exception instanceof Error
          ? exception.stack
          : JSON.stringify(exception, null, 2);
      this.logger.error(`${request.method} ${request.url}`, detail);
    }

    response.status(status).json({
      statusCode: status,
      message,
      path: request.url,
      timestamp: new Date().toISOString(),
    });
  }
}
