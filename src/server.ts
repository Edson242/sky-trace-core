import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import { initializeSocketGateway } from './modules/socket/socket.gateway';
// Importamos os contadores recém-criados
import {
  startRadarEngine,
  weatherApiCallsToday,
  MAX_WEATHER_CALLS,
  MAX_OPENSKY_CALLS
} from './modules/radar/engine';
import { openSkyCreditsRemaining } from './modules/radar/opensky.service';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

initializeSocketGateway(io);
startRadarEngine(io);

app.get('/health', (req, res) => {
  res.json({ status: 'SkyTrace API is running', timestamp: new Date().toISOString() });
});

// NOVA ROTA: Consumo de APIs
app.get('/api/metrics', (req, res) => {
  res.json({
    openWeather: {
      used: weatherApiCallsToday,
      max: MAX_WEATHER_CALLS,
      percentage: ((weatherApiCallsToday / MAX_WEATHER_CALLS) * 100).toFixed(2)
    },
    openSky: {
      // Fonte real: header X-Rate-Limit-Remaining devolvido pela própria OpenSky a cada chamada.
      // null até a primeira chamada bem-sucedida do ciclo do radar.
      creditsRemaining: openSkyCreditsRemaining,
      max: MAX_OPENSKY_CALLS,
      used: openSkyCreditsRemaining !== null ? MAX_OPENSKY_CALLS - openSkyCreditsRemaining : null,
      percentage: openSkyCreditsRemaining !== null
        ? (((MAX_OPENSKY_CALLS - openSkyCreditsRemaining) / MAX_OPENSKY_CALLS) * 100).toFixed(2)
        : null
    },
    connectedClients: io.engine.clientsCount,
    uptimeSeconds: Math.floor(process.uptime())
  });
});

const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
  console.log(`🚀 SkyTrace Server online na porta ${PORT}`);
  console.log(`📡 WebSocket Gateway aguardando conexões...`);
});