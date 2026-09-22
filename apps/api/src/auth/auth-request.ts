import type { ApiRequest } from '../http/api-exception.filter.js';

export type AuthRequest = ApiRequest & {
  user?: { id: string; email: string };
  authSession?: { id: string; csrfHash: string };
};
