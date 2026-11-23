import { createRemoteJWKSet, jwtVerify, type JWTPayload } from 'jose';

import { config } from './config.js';

const issuer = `https://${config.auth0Domain}/`;

// Auth0's public signing keys; jose fetches and caches them.
const jwks = createRemoteJWKSet(new URL(`${issuer}.well-known/jwks.json`));

export type AuthUser = {
  sub: string; // Auth0 user id, e.g. "auth0|abc123" or "google-oauth2|123"
  token: string;
  claims: JWTPayload;
};

/**
 * Returns the authenticated user for a request, or null if there's no token.
 * Throws if a token is present but invalid (expired, wrong audience, bad signature…).
 */
export async function getUserFromAuthHeader(header: string | undefined): Promise<AuthUser | null> {
  if (!header) return null;

  const [scheme, token] = header.split(' ');
  if (scheme?.toLowerCase() !== 'bearer' || !token) return null;

  const { payload } = await jwtVerify(token, jwks, {
    issuer,
    audience: config.auth0Audience,
  });

  if (!payload.sub) throw new Error('Token has no subject');
  return { sub: payload.sub, token, claims: payload };
}
