export type AppRole = 'READ' | 'UPDATE' | 'ADMIN';

export interface UserClaims {
  sub?: string;
  preferred_username?: string;
  given_name?: string;
  family_name?: string;
  email?: string;
  realm_access?: {
    roles?: string[];
  };
  resource_access?: Record<string, { roles?: string[] }>;
  [claim: string]: unknown;
}
