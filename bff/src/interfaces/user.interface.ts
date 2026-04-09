export interface User extends Record<string, unknown> {
  id: string; // The same as partyId, used for frontend compat
  partyId: string;
  personNumber: string;
  name: string;
  givenName: string;
  surname: string;
  username: string;
  nameID: string;
  nameIDFormat: string;
  sessionIndex: string;
  authMethod: 'local' | 'oidc' | 'saml';
  role: string;
}
