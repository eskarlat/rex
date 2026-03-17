import type { FastifyInstance, FastifyError } from 'fastify';
import fp from 'fastify-plugin';

interface ErrorResponse {
  error: string;
  code?: string;
}

const STATUS_MAP: Record<string, number> = {
  MANIFEST_INVALID: 400,
  CONFIG_INVALID: 400,
  COMMAND_NOT_FOUND: 404,
  EXTENSION_NOT_FOUND: 404,
  MANIFEST_NOT_FOUND: 404,
  COMMAND_HANDLER_NOT_FOUND: 404,
  VAULT_DECRYPT_FAILED: 500,
  MCP_SPAWN_FAILED: 502,
  MCP_TIMEOUT: 504,
  MCP_DISCONNECTED: 502,
  MCP_CONNECTION_FAILED: 502,
  MCP_REQUEST_FAILED: 502,
  MCP_PROCESS_CRASHED: 502,
  REGISTRY_UNREACHABLE: 502,
  HOOK_FAILED: 500,
  COMMAND_EXECUTION_FAILED: 500,
};

export function getStatusCode(error: FastifyError | Error): number {
  if ('statusCode' in error && typeof error.statusCode === 'number') {
    return error.statusCode;
  }
  if ('code' in error && typeof error.code === 'string') {
    const mapped = STATUS_MAP[error.code];
    if (mapped !== undefined) {
      return mapped;
    }
  }
  return 500;
}

export default fp(
  (fastify: FastifyInstance) => {
    fastify.setErrorHandler((rawError: unknown, _request, reply) => {
      const error = rawError instanceof Error ? rawError : new Error(String(rawError));
      const statusCode = getStatusCode(error);
      const response: ErrorResponse = {
        error: error.message,
      };

      if ('code' in error && typeof (error as Record<string, unknown>)['code'] === 'string') {
        response.code = (error as Record<string, unknown>)['code'] as string;
      }

      void reply.status(statusCode).send(response);
    });
  },
  { name: 'error-handler' },
);
