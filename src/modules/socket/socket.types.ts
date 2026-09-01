export type ThreatLevel = 'SAFE' | 'WARNING' | 'CRITICAL';

export interface EnvironmentData {
  windSpeed: number;
  windGust: number;
  precipitation: number;
  visibility: number;
  turbulenceIndex: 'SEGURO' | 'MODERADO' | 'PERIGOSO';
}

export interface Flight {
  id: string;
  originCountry: string;
  lat: number;
  lng: number;
  altitude: number;
  velocity: number;
  heading: number;
  threatLevel: ThreatLevel;
  squawk: string | null;
  category: number;
  environment?: EnvironmentData;
}

export interface SystemHealth {
  weatherQuotaUsed: number;
  weatherQuotaMax: number;
  dataSource: 'OPENSKY_REAL_TIME' | 'MOCK_ENGINE';
  connectedClients: number;
}

export interface RadarUpdatePayload {
  timestamp: number;
  activeFlights: Flight[];
  systemHealth: SystemHealth;
}

export interface RouteDeviationPayload {
  flightId: string;
  reason: string;
}