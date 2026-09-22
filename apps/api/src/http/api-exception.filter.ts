import { randomUUID } from 'node:crypto';
import { Catch, HttpException } from '@nestjs/common';
import type { ArgumentsHost, ExceptionFilter } from '@nestjs/common';
import type { Request, Response } from 'express';

export type ApiRequest = Request & { requestId: string };

@Catch()
export class ApiExceptionFilter implements ExceptionFilter {
  catch(error: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<ApiRequest>();
    const response = ctx.getResponse<Response>();
    // Express parser errors are not Nest HttpExceptions.
    const parserType = typeof error === 'object' && error !== null && 'type' in error ? error.type : undefined;
    const status = error instanceof HttpException ? error.getStatus()
      : parserType === 'entity.too.large' ? 413 : parserType === 'entity.parse.failed' ? 400 : 500;
    const errors: Record<number, [string, string]> = {
      400: ['BAD_REQUEST', 'Requisição inválida.'],
      401: ['UNAUTHORIZED', 'Autenticação necessária.'],
      403: ['FORBIDDEN', 'Acesso recusado.'],
      404: ['NOT_FOUND', 'Recurso não encontrado.'],
      409: ['CONFLICT', 'Conflito com o estado atual.'],
      413: ['PAYLOAD_TOO_LARGE', 'Corpo da requisição excede o limite permitido.'],
      422: ['UNPROCESSABLE_ENTITY', 'Dados inválidos para esta operação.'],
      429: ['TOO_MANY_REQUESTS', 'Muitas tentativas. Tente novamente mais tarde.'],
    };
    const [code, message] = errors[status] ?? ['INTERNAL_ERROR', 'Erro interno.'];
    const requestId = request.requestId ?? randomUUID();
    response.setHeader('X-Request-Id', requestId);
    response.status(status).json({ code, message, requestId });
  }
}
