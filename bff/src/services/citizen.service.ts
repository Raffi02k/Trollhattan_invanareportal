import axios from 'axios';
import { config } from '../config';

export class CitizenApiService {
  /**
   * Translates a personnummer to a partyId (GUID) via the Citizen API.
   * Expects the API to return a raw string containing the UUID.
   */
  public async getPartyId(municipalityId: string, personNumber: string): Promise<string> {
    try {
      const url = `${config.citizenApiUrl}/${municipalityId}/${personNumber}/guid`;
      const response = await axios.get(url);
      
      // Since the API returns a raw string format for compatibility reasons
      // ("550e8400-e29b-41d4-a716-446655440000" rather than a JSON object)
      const partyId = response.data.trim();
      
      if (!partyId) {
        throw new Error('No partyId returned from Citizen API');
      }
      
      return partyId;
    } catch (error) {
      console.error('Failed to resolve partyId from Citizen API:', error);
      throw error;
    }
  }
}

export const citizenApiService = new CitizenApiService();
