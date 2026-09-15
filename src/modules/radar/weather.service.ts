import axios from 'axios';
import { HttpsProxyAgent } from 'https-proxy-agent';
import { ThreatLevel, EnvironmentData } from '../socket/socket.types';

const proxyUrl = process.env.HTTPS_PROXY || process.env.HTTP_PROXY;
const httpsAgent = proxyUrl ? new HttpsProxyAgent(proxyUrl) : undefined;


interface CacheEntry {
  timestamp: number;
  threatLevel: ThreatLevel;
  windSpeed: number;
  condition: string;
  environment: EnvironmentData;
}

const WEATHER_CACHE = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 3 * 60 * 1000; // 3 minutos

export async function evaluateFlightRisk(flightId: string, lat: number, lng: number): Promise<{ threatLevel: ThreatLevel, apiCalled: boolean, windSpeed: number | null, condition: string | null, environment: EnvironmentData | null }> {
  const now = Date.now();
  const cached = WEATHER_CACHE.get(flightId);

  if (cached && (now - cached.timestamp < CACHE_TTL_MS)) {
    return { threatLevel: cached.threatLevel, apiCalled: false, windSpeed: cached.windSpeed, condition: cached.condition, environment: cached.environment };
  }

  try {
    const apiKey = process.env.OPENWEATHER_API_KEY;
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&appid=${apiKey}&units=metric`;

    const response = await axios.get(url, { httpsAgent });

    const windSpeedKmH = response.data.wind?.speed ? response.data.wind.speed * 3.6 : 0;
    const windGustKmH = response.data.wind?.gust ? response.data.wind.gust * 3.6 : 0;
    const precipitation = response.data.rain?.['1h'] || response.data.snow?.['1h'] || 0;
    const visibilityKm = (response.data.visibility || 10000) / 1000;
    const condition = response.data.weather?.[0]?.main?.toUpperCase() || 'CLEAR'; // Ex: CLEAR, RAIN, THUNDERSTORM

    let threat: ThreatLevel = 'SAFE';
    let turbulenceIndex: 'SEGURO' | 'MODERADO' | 'PERIGOSO' = 'SEGURO';

    if (windSpeedKmH > 80 || condition === 'THUNDERSTORM' || condition === 'TORNADO') {
      threat = 'CRITICAL';
      turbulenceIndex = 'PERIGOSO';
    } else if (windSpeedKmH > 50 || condition === 'RAIN' || condition === 'SNOW') {
      threat = 'WARNING';
      turbulenceIndex = 'MODERADO';
    }

    const environment: EnvironmentData = {
      windSpeed: Math.round(windSpeedKmH),
      windGust: Math.round(windGustKmH),
      precipitation,
      visibility: Math.round(visibilityKm),
      turbulenceIndex
    };

    WEATHER_CACHE.set(flightId, { timestamp: now, threatLevel: threat, windSpeed: windSpeedKmH, condition, environment });

    return { threatLevel: threat, apiCalled: true, windSpeed: windSpeedKmH, condition, environment };

  } catch (error: any) {
    console.error(`❌ [Weather] Erro no clima para o voo ${flightId}:`, error.message);
    const safeEnvironment: EnvironmentData = { windSpeed: 0, windGust: 0, precipitation: 0, visibility: 10, turbulenceIndex: 'SEGURO' };
    return { threatLevel: 'SAFE', apiCalled: false, windSpeed: null, condition: null, environment: safeEnvironment }; // Fallback seguro
  }
}