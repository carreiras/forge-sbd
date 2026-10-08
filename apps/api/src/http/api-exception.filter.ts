import { randomUUID } from 'node:crypto';
import { Catch, HttpException } from '@nestjs/common';
import type { ArgumentsHost, ExceptionFilter } from '@nestjs/common';
import type { Request, Response } from 'express';

export type ApiRequest = Request & { requestId: string };

// Services may refine a client error with a stable code and a safe Portuguese message.
function specificError(error: unknown, status: number): [string, string] | undefined {
  if (!(error instanceof HttpException) || status < 400 || status >= 500) return undefined;
  const body = error.getResponse();
  if (typeof body !== 'object' || body === null) return undefined;
  const { code, message } = body as Record<string, unknown>;
  return typeof code === 'string' && /^[A-Z][A-Z_]{2,63}$/.test(code) && typeof message === 'string' ? [code, message] : undefined;
}

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
    const [code, message] = specificError(error, status) ?? errors[status] ?? ['INTERNAL_ERROR', 'Erro interno.'];
    const requestId = request.requestId ?? randomUUID();
    response.setHeader('X-Request-Id', requestId);
    response.status(status).json({ code, message, requestId });
  }
}
