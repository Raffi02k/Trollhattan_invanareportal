import { Strategy, VerifiedCallback, Profile as SamlProfile } from '@node-saml/passport-saml';
import { citizenApiService } from '../services/citizen.service';
import { User } from '../interfaces/user.interface';
import { config } from '../config';

// Extending standard SAML profile with the expected attributes from BankID/IdP
export interface Profile extends SamlProfile {
  citizenIdentifier: string; // Often where Personnummer is returned
  firstname: string;
  Surname: string; // Note: uppercase 'S' as in Business Center
  attributes: { [key: string]: any };
}

const samlOptions: any = {
  disableRequestedAuthnContext: true,
  identifierFormat: 'urn:oasis:names:tc:SAML:2.0:nameid-format:transient',
  callbackUrl: config.samlCallbackUrl,
  entryPoint: config.samlEntrySso,
  issuer: config.samlIssuer,
  idpCert: config.samlIdpPublicCert,
  signatureAlgorithm: 'sha256',
  digestAlgorithm: 'sha256',
  wantAssertionsSigned: false,
  wantAuthnResponseSigned: false,
};

if (config.samlPrivateKey) {
  samlOptions.privateKey = config.samlPrivateKey;
}

export const samlStrategy = new Strategy(
  samlOptions,
  async function (profile: Profile | null, done: VerifiedCallback) {
    if (!profile) {
      return done({
        name: 'SAML_MISSING_PROFILE',
        message: 'No profile found in SAML Assertion',
      });
    }

    const { firstname: givenName, Surname: surname, citizenIdentifier } = profile;

    if (!givenName || !surname || !citizenIdentifier) {
      return done(null, null, {
        message: 'SAML_MISSING_ATTRIBUTES - Ensure BankID provides firstname, Surname and citizenIdentifier',
      });
    }

    try {
      const personNumber = citizenIdentifier;
      
      // Look up or create the partyId in our own Citizen API!
      const partyId = await citizenApiService.getPartyId(config.municipalityId, personNumber);

      // Construct the User object expected by the frontend
      const findUser: User = {
        id: partyId,
        partyId: partyId,
        personNumber: personNumber,
        name: `${givenName} ${surname}`,
        givenName,
        surname,
        username: 'unknown',
        nameID: profile.nameID || '',
        nameIDFormat: profile.nameIDFormat || '',
        sessionIndex: profile.sessionIndex || '',
        authMethod: 'saml',
        role: 'User' // Default role for portal users
      };

      // In a real application, you might check if they exist in a local DB here, 
      // but for the portal, we just pass the JWT/session forward.
      done(null, findUser);
    } catch (err: any) {
      console.error("Error connecting to Citizen API during SAML verification:", err.message);
      done({
        name: 'SAML_CITIZEN_FAILED',
        message: 'Failed to fetch User from Citizen API: ' + err.message
      } as Error);
    }
  },
  async function (profile: Profile | null, done: VerifiedCallback) {
    // Logout verify
    return done(null, {});
  }
);
