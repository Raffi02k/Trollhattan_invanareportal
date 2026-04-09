import express from 'express';
import session from 'express-session';
import passport from 'passport';
import cors from 'cors';
import bodyParser from 'body-parser';
import punycode from 'punycode';
import { config } from './config';
import { samlStrategy } from './auth/saml.strategy';
import { User } from './interfaces/user.interface';
import { oepService } from './services/oep.service';
import { citizenApiService } from './services/citizen.service';
import { contactSettingsApiService } from './services/contactsettings.service';
import { ContactMethod } from './services/contactsettings.service';

const app = express();

const sanitizeContactValue = (value: unknown): string => {
  if (typeof value === 'string') {
    return value;
  }

  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }

  return '';
};

const splitEmail = (email: string): { local: string; domain: string } | null => {
  const atIndex = email.lastIndexOf('@');
  if (atIndex <= 0 || atIndex === email.length - 1) {
    return null;
  }

  return {
    local: email.slice(0, atIndex),
    domain: email.slice(atIndex + 1)
  };
};

const decodeEmailDomain = (email: string): string => {
  const parts = splitEmail(email);
  if (!parts) {
    return email;
  }

  try {
    return `${parts.local}@${punycode.toUnicode(parts.domain)}`;
  } catch {
    return email;
  }
};

const encodeEmailDomain = (email: string): string => {
  const parts = splitEmail(email);
  if (!parts) {
    return email;
  }

  try {
    return `${parts.local}@${punycode.toASCII(parts.domain)}`;
  } catch {
    return email;
  }
};

app.use(cors({
  origin: config.frontendUrl,
  credentials: true
}));

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Setup Express Sessions (Required by Passport-SAML)
app.use(session({
  secret: config.sessionSecret,
  resave: false,
  saveUninitialized: false,
  cookie: {
    path: '/',
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production'
  }
}));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());
passport.use('saml', samlStrategy as any);

passport.serializeUser((user, done) => {
  done(null, user);
});
passport.deserializeUser((user: any, done) => {
  done(null, user);
});

// Debug middleware to log session info
app.use((req, res, next) => {
  if (req.path.startsWith('/api/auth')) {
    console.log(`[AUTH DEBUG] ${req.method} ${req.path} - Session ID: ${req.sessionID} - User: ${req.user ? (req.user as any).name : 'None'}`);
  }
  next();
});

// --- Development / Mock Auth (Useful when IdP is missing) ---
app.get('/api/auth/dev-login', async (req, res) => {
  try {
    const testPersonNum = (req.query.pnr as string) || '199001019802';
    // Integrate with Citizen API to get a real partyId from the local DB
    const partyId = await citizenApiService.getPartyId(config.municipalityId, testPersonNum);

    const isGustav = testPersonNum === '198001019804';

    // Clear any existing session before logging in the new dev user
    req.logout((err) => {
      if (err) {
        console.error("Logout during dev-login failed:", err);
      }
      
      const mockUser: User = {
        id: partyId,
        partyId: partyId,
        personNumber: testPersonNum,
        name: isGustav ? 'Gustav Test' : 'Raffi Mock',
        givenName: isGustav ? 'Gustav' : 'Raffi',
        surname: isGustav ? 'Test' : 'Mock',
        username: testPersonNum,
        nameID: 'mock-name-id',
        nameIDFormat: 'urn:oasis:names:tc:SAML:1.1:nameid-format:unspecified',
        sessionIndex: 'mock-session-index',
        authMethod: 'saml',
        role: isGustav ? 'User' : 'Admin'
      };

      req.login(mockUser, async (err) => {
        if (err) {
          return res.status(500).json({ message: 'Failed to mock login', error: err.message });
        }
        
        // Save basic info to new Contact Settings API upon login
        try {
          // Check if settings already exist, if not create them
          const existing = await contactSettingsApiService.getContactSettingByPartyId(config.municipalityId, partyId);
          if (!existing) {
             const defaultEmail = isGustav ? 'Gustav@trollhättan.se' : 'raffi@trollhättan.se';
             const defaultPhone = isGustav ? '070-123 78 98' : '072-987 65 43';
             await contactSettingsApiService.createContactSetting(config.municipalityId, partyId, encodeEmailDomain(defaultEmail), defaultPhone);
          }
        } catch (dbErr) {
          console.error("Failed to initialize contact settings during dev-login:", dbErr);
        }

        // Explicitly save the session before redirecting to ensure persistence
        req.session.save(() => {
          res.redirect(`${config.frontendUrl}/dashboard`);
        });
      });
    });
  } catch (error: any) {
    console.error("Dev-login failed to reach Citizen API:", error);
    res.status(500).send("Dev-login failed: " + error.message);
  }
});

// --- SAML Auth Routes ---

// 1. Entry point for SAML Login (Triggered from Frontend React App)
app.get('/api/auth/saml/login', passport.authenticate('saml', {
  failureRedirect: '/api/auth/saml/login', // Simple retry logic
  failureFlash: true
}));

// 2. Callback from IdP after BankID login
app.post('/api/auth/saml/callback',
  passport.authenticate('saml', { failureRedirect: `${config.frontendUrl}/login?error=SAML_FAILED` }),
  (req, res) => {
    // On success, we have req.user populated with our constructed User object containing partyId
    console.log("Logged in user with BankID:", req.user);
    res.redirect(`${config.frontendUrl}/`);
  }
);

// 3. Endpoint for frontend to check if a user is currently logged in via SAML
app.get('/api/auth/me', (req, res) => {
  if (req.isAuthenticated()) {
    return res.json(req.user);
  }
  return res.status(401).json({ message: "Not authenticated" });
});

// 4. Logout endpoint
app.post('/api/auth/logout', (req, res, next) => {
  const sessionId = req.sessionID;
  console.log(`[AUTH DEBUG] Logging out session: ${sessionId}`);
  req.logout((err) => {
    if (err) { return next(err); }
    req.session.destroy((err) => {
      if (err) { return next(err); }
      // Explicitly clear the cookie with all common options to be sure
      res.clearCookie('connect.sid', { path: '/', httpOnly: true, secure: process.env.NODE_ENV === 'production' });
      console.log(`[AUTH DEBUG] Session destroyed: ${sessionId}`);
      res.json({ message: 'Successfully logged out' });
    });
  });
});
// --- Dashboard API Endpoints (Replacements for Python Backend) ---

// 1. Get current user profile (aggregated from both services)
app.get('/api/me', async (req, res) => {
  if (req.isAuthenticated()) {
    const user = req.user as User;
    
    // Fetch contact details from the new microservice
    let contactInfo = { email: "", phoneNumber: "" };
    try {
      const settings = await contactSettingsApiService.getContactSettingByPartyId(config.municipalityId, user.partyId);
      if (settings && settings.contactChannels) {
        const emailDestination = settings.contactChannels.find(c => c.contactMethod === ContactMethod.EMAIL)?.destination;
        const phoneDestination = settings.contactChannels.find(c => c.contactMethod === ContactMethod.SMS)?.destination;
        contactInfo.email = decodeEmailDomain(sanitizeContactValue(emailDestination));
        contactInfo.phoneNumber = sanitizeContactValue(phoneDestination);
      }
    } catch (err) {
      console.error("Failed to fetch contact settings from port 8081:", err);
    }

    res.json({
      full_name: user.name,
      given_name: user.givenName,
      surname: user.surname,
      personnummer: user.personNumber,
      party_id: user.partyId,
      email: contactInfo.email,
      phone_number: contactInfo.phoneNumber
    });
  } else {
    res.status(401).json({ message: "Not authenticated" });
  }
});

// 2. Update user profile
app.patch('/api/me', async (req, res) => {
  if (req.isAuthenticated()) {
    const user = req.user as User;
    try {
      const email = sanitizeContactValue(req.body?.email);
      const phoneNumber = sanitizeContactValue(req.body?.phone_number);
      const emailForStorage = encodeEmailDomain(email);
      // Fetch setting to get its ID first
      let settings = await contactSettingsApiService.getContactSettingByPartyId(config.municipalityId, user.partyId);
      
      if (!settings) {
        // Create if missing
        await contactSettingsApiService.createContactSetting(config.municipalityId, user.partyId, emailForStorage, phoneNumber);
      } else {
        // Update existing
        await contactSettingsApiService.updateContactSetting(
          config.municipalityId,
          settings.id,
          emailForStorage,
          phoneNumber
        );
      }
      res.json({ email: decodeEmailDomain(email), phone_number: phoneNumber, message: "Profile updated successfully (via ContactSettings API)" });
    } catch (err) {
      console.error("Failed to update profile on port 8081:", err);
      res.status(500).json({ message: "Failed to update profile in ContactSettings service" });
    }
  } else {
    res.status(401).json({ message: "Not authenticated" });
  }
});

// 3. Get cases for the current user
app.get('/api/cases', async (req, res) => {
  if (req.isAuthenticated()) {
    const user = req.user as User;
    const cases = await oepService.getCasesForParty(user.partyId);
    res.json(cases);
  } else {
    res.status(401).json({ message: "Not authenticated" });
  }
});

// 4. Get all documents
app.get('/api/documents', async (req, res) => {
  if (req.isAuthenticated()) {
    const user = req.user as User;
    const documents = await oepService.getAllDocumentsForParty(user.partyId);
    res.json(documents);
  } else {
    res.status(401).json({ message: "Not authenticated" });
  }
});

// 5. Download a document
app.get('/api/documents/:id/download', (req, res) => {
  if (req.isAuthenticated()) {
    // In a real app, we would stream the file from a storage service or API
    res.send("Mock document content for " + req.params.id);
  } else {
    res.status(401).json({ message: "Not authenticated" });
  }
});

// 6. Delete a document
app.delete('/api/documents/:id', (req, res) => {
  if (req.isAuthenticated()) {
    res.json({ message: "Document deleted (mock)" });
  } else {
    res.status(401).json({ message: "Not authenticated" });
  }
});

// 7. Post a message to a case
app.post('/api/cases/:id/messages', (req, res) => {
  if (req.isAuthenticated()) {
    const user = req.user as User;
    const { content } = req.body;
    const newMessage = {
      id: "msg-" + Date.now(),
      sender: user.name,
      sender_role: "Sökande",
      content,
      created: new Date().toISOString()
    };
    res.status(201).json(newMessage);
  } else {
    res.status(401).json({ message: "Not authenticated" });
  }
});

// 8. Upload a document to a case
app.post('/api/cases/:id/documents', (req, res) => {
  if (req.isAuthenticated()) {
    // Mock upload response
    const newDoc = {
      id: "upload-" + Date.now(),
      filename: "Komplettering.pdf",
      type: "Bilaga",
      created: new Date().toISOString(),
      linked_to: "Ärende " + req.params.id
    };
    res.status(201).json(newDoc);
  } else {
    res.status(401).json({ message: "Not authenticated" });
  }
});

app.listen(config.port, () => {
  console.log(`BFF Server listening on port ${config.port}`);
  console.log(`SAML Callback URL: ${config.samlCallbackUrl}`);
});
