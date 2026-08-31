import axios from 'axios';
import { Flight } from '../socket/socket.types';

const BRAZIL_BOX = {
  lamin: -33.7,
  lamax: 5.2,
  lomin: -73.9,
  lomax: -34.7
};

let accessToken: string | null = null;
let tokenExpiresAt: number = 0;

export let openSkyCreditsRemaining: number | null = null;

async function getAccessToken(): Promise<string | null> {
  if (accessToken && Date.now() < tokenExpiresAt - 60000) {
    return accessToken;
  }

  try {
    const response = await axios.post(
      'https://auth.opensky-network.org/auth/realms/opensky-network/protocol/openid-connect/token',
      new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: process.env.OPENSKY_CLIENT_ID as string,
        client_secret: process.env.OPENSKY_CLIENT_SECRET as string
      }).toString(),
      {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      }
    );

    accessToken = response.data.access_token;
    const expiresIn = response.data.expires_in || 1800;
    tokenExpiresAt = Date.now() + (expiresIn * 1000);

    console.log('✅ [OpenSky Auth] Novo Access Token gerado com sucesso.');
    return accessToken;
  } catch (error: any) {
    console.error('❌ [OpenSky Auth] Erro:', error.response?.data || error.message);
    return null;
  }
}

export async function fetchRealFlights(): Promise<Flight[]> {
  try {
    const token = await getAccessToken();
    if (!token) throw new Error("Falha na autenticação OAuth2");

    const url = `https://opensky-network.org/api/states/all?lamin=${BRAZIL_BOX.lamin}&lamax=${BRAZIL_BOX.lamax}&lomin=${BRAZIL_BOX.lomin}&lomax=${BRAZIL_BOX.lomax}&extended=1`;

    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    const remainingHeader = response.headers['x-rate-limit-remaining'];
    if (remainingHeader !== undefined) {
      openSkyCreditsRemaining = Number(remainingHeader);
    }

    const allFlights = response.data.states || [];

    return allFlights
      .filter((state: any[]) => state[2] === 'Brazil' && state[8] === false)
      .map((state: any[]) => ({
        id: state[1] ? state[1].trim() : 'UNKNOWN',
        originCountry: state[2],
        lng: state[5] || 0,
        lat: state[6] || 0,
        altitude: state[7] || 0,
        velocity: state[9] || 0,
        heading: state[10] || 0,
        threatLevel: 'SAFE',
        squawk: state[14] || null,
        category: state[17] || 0
      }));

  } catch (error: any) {
    console.error('❌ [OpenSky] Erro ao buscar voos reais:', error.response?.data || error.message);
    return [];
  }
}