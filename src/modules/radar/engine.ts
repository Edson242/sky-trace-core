import { Server } from 'socket.io';
import { connectedClients } from '../socket/socket.gateway';
import { Flight, RadarUpdatePayload, ThreatLevel } from '../socket/socket.types';
import { fetchRealFlights } from './opensky.service';
import { evaluateFlightRisk } from './weather.service';
import { db } from '../../config/prisma/db';
import { DADOS_MOCKADOS } from './mockData';

const USE_REAL_DATA: boolean = process.env.DADOS_MOCKADOS !== 'TRUE';

export let weatherApiCallsToday: number = 0;
export const MAX_WEATHER_CALLS: number = 1000;
export const MAX_OPENSKY_CALLS: number = 4000;

const lastThreatLevel = new Map<string, ThreatLevel>();

export function startRadarEngine(io: Server): void {
  console.log("⚙️ Motor do Radar e Auditoria iniciados...");

  setInterval(async (): Promise<void> => {
    if (connectedClients === 0) return;

    let flights: Flight[] = [];

    if (USE_REAL_DATA) {
      flights = await fetchRealFlights();
      if (flights.length === 0) {
        console.log("⚠️ [Radar] API do OpenSky falhou ou retornou vazio. Usando fallback de dados mockados.");
        flights = JSON.parse(JSON.stringify(DADOS_MOCKADOS));
      }
    } else {
      flights = JSON.parse(JSON.stringify(DADOS_MOCKADOS));
    }

    for (const flight of flights) {
      if (weatherApiCallsToday >= MAX_WEATHER_CALLS) {
        console.log("⚠️ Limite diário de clima atingido.");
        break; // Proteção para não estourar a cota gratuita
      }

      const risk = await evaluateFlightRisk(flight.id, flight.lat, flight.lng);
      flight.threatLevel = flight.squawk === '7700' ? 'CRITICAL' : risk.threatLevel;

      if (risk.environment) {
        flight.environment = risk.environment;
        if (flight.squawk === '7700') {
           flight.environment.turbulenceIndex = 'PERIGOSO';
        }
      }

      if (risk.apiCalled) {
        weatherApiCallsToday++;
        // Pausa de 100ms APENAS se fez requisição real na API (evita o Erro 429 - Too Many Requests)
        await new Promise(res => setTimeout(res, 100)); 
      }

      const previousThreatLevel = lastThreatLevel.get(flight.id) ?? 'SAFE';
      if (flight.threatLevel !== previousThreatLevel) {
        lastThreatLevel.set(flight.id, flight.threatLevel);

        if (flight.threatLevel === 'WARNING' || flight.threatLevel === 'CRITICAL') {
          try {
            await db.orm.public.Flight.upsert({
              create: { id: flight.id, originCountry: flight.originCountry, category: flight.category },
              update: { originCountry: flight.originCountry, category: flight.category }
            });

            await db.orm.public.AlertLog.create({
              id: crypto.randomUUID(),
              flightId: flight.id,
              threatLevel: flight.threatLevel,
              lat: flight.lat,
              lng: flight.lng,
              windSpeed: risk.windSpeed,
              condition: risk.condition,
              squawk: flight.squawk
            });
          } catch (dbError) {
            console.error(`[DB ERRO] Falha ao salvar auditoria do voo ${flight.id}:`, dbError);
          }
        }
      }
    }

    const payload: RadarUpdatePayload = {
      timestamp: Date.now(),
      activeFlights: flights,
      systemHealth: {
        weatherQuotaUsed: weatherApiCallsToday,
        weatherQuotaMax: MAX_WEATHER_CALLS,
        dataSource: USE_REAL_DATA ? 'OPENSKY_REAL_TIME' : 'MOCK_ENGINE',
        connectedClients: connectedClients
      }
    };

    io.emit('radar_update', payload);

  }, 10000);
}