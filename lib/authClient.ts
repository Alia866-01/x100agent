/**
 * Neon Auth Client
 * Initialized with environment variable VITE_NEON_AUTH_URL
 */

import { createAuthClient } from '@neondatabase/neon-js/auth';
import { BetterAuthReactAdapter } from '@neondatabase/neon-js/auth/react';

const NEON_AUTH_URL = import.meta.env.VITE_NEON_AUTH_URL;

if (!NEON_AUTH_URL) {
  console.warn('[AuthClient] VITE_NEON_AUTH_URL is not set. Auth will not work.');
}

export const authClient = createAuthClient(NEON_AUTH_URL, {
  adapter: BetterAuthReactAdapter(),
});
