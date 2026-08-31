import axios from 'axios';
import { ThreatLevel } from '../socket/socket.types';

interface CacheEntry {
  timestamp: number;
  threatLevel: ThreatLevel;
  windSpeed: number;
  condition: string;
}

const WEATHER_CACHE = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 3 * 60 * 1000; // 3 minutos

export async function evaluateFlightRisk(flightId: string, lat: number, lng: number): Promise<{ threatLevel: ThreatLevel, apiCalled: boolean, windSpeed: number | null, condition: string | null }> {
  const now = Date.now();
  const cached = WEATHER_CACHE.get(flightId);

  if (cached && (now - cached.timestamp < CACHE_TTL_MS)) {
    return { threatLevel: cached.threatLevel, apiCalled: false, windSpeed: cached.windSpeed, condition: cached.condition };
  }

  try {
    const apiKey = process.env.OPENWEATHER_API_KEY;
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&appid=${apiKey}&units=metric`;

    const response = await axios.get(url);

    const windSpeedKmH = response.data.wind.speed * 3.6;
    const condition = response.data.weather[0].main.toUpperCase(); // Ex: CLEAR, RAIN, THUNDERSTORM

    let threat: ThreatLevel = 'SAFE';

    if (windSpeedKmH > 80 || condition === 'THUNDERSTORM' || condition === 'TORNADO') {
      threat = 'CRITICAL';
    } else if (windSpeedKmH > 50 || condition === 'RAIN' || condition === 'SNOW') {
      threat = 'WARNING';
    }

    WEATHER_CACHE.set(flightId, { timestamp: now, threatLevel: threat, windSpeed: windSpeedKmH, condition });

    return { threatLevel: threat, apiCalled: true, windSpeed: windSpeedKmH, condition };

  } catch (error: any) {
    console.error(`❌ [Weather] Erro no clima para o voo ${flightId}:`, error.message);
    return { threatLevel: 'SAFE', apiCalled: false, windSpeed: null, condition: null }; // Fallback seguro
  }
}