import axios from 'axios';
import { config } from '../config';

export enum ContactMethod {
  EMAIL = 'EMAIL',
  SMS = 'SMS'
}

export interface ContactChannel {
  contactMethod: ContactMethod;
  alias?: string;
  destination: string;
  disabled: boolean;
}

export interface ContactSetting {
  id: string;
  partyId: string;
  municipalityId: string;
  alias?: string;
  contactChannels: ContactChannel[];
}

export class ContactSettingsApiService {
  /**
   * Retrieves contact settings for a given partyId.
   */
  public async getContactSettingByPartyId(municipalityId: string, partyId: string): Promise<ContactSetting | null> {
    try {
      const url = `${config.contactSettingsApiUrl}/${municipalityId}/settings?partyId=${partyId}`;
      const response = await axios.get(url);
      return response.data;
    } catch (error: any) {
      if (error.response && error.response.status === 404) {
        return null; // Not found is a valid state (no settings yet)
      }
      console.error('Failed to get contact settings:', error);
      return null;
    }
  }

  /**
   * Creates a new contact setting.
   */
  public async createContactSetting(municipalityId: string, partyId: string, email?: string, phoneNumber?: string): Promise<string> {
    try {
      const channels: ContactChannel[] = [];
      if (email) {
        channels.push({ contactMethod: ContactMethod.EMAIL, destination: email, disabled: false, alias: 'Primary' });
      }
      if (phoneNumber) {
        channels.push({ contactMethod: ContactMethod.SMS, destination: phoneNumber, disabled: false, alias: 'Primary' });
      }

      const url = `${config.contactSettingsApiUrl}/${municipalityId}/settings`;
      const response = await axios.post(url, {
        partyId,
        alias: 'User Settings',
        contactChannels: channels
      });

      // The API returns 201 Created with Location header, or just returns the ID if we return it in service
      // Based on our implementation, it returns URI in header. 
      // But we can also return nothing and just rely on the ID being generated.
      return response.headers.location?.split('/').pop() || '';
    } catch (error) {
      console.error('Failed to create contact settings:', error);
      throw error;
    }
  }

  /**
   * Updates an existing contact setting.
   */
  public async updateContactSetting(municipalityId: string, settingId: string, email?: string, phoneNumber?: string): Promise<void> {
    try {
      const channels: ContactChannel[] = [];
      if (email) {
        channels.push({ contactMethod: ContactMethod.EMAIL, destination: email, disabled: false, alias: 'Primary' });
      }
      if (phoneNumber) {
        channels.push({ contactMethod: ContactMethod.SMS, destination: phoneNumber, disabled: false, alias: 'Primary' });
      }

      const url = `${config.contactSettingsApiUrl}/${municipalityId}/settings/${settingId}`;
      await axios.patch(url, {
        alias: 'User Settings',
        contactChannels: channels
      });
    } catch (error) {
      console.error('Failed to update contact settings:', error);
      throw error;
    }
  }
}

export const contactSettingsApiService = new ContactSettingsApiService();
