import { Flight } from '../socket/socket.types';

export const DADOS_MOCKADOS: Flight[] = [
  // 3 Voos em emergência (squawk 7700)
  { id: 'AZU1001', originCountry: 'Brazil', lat: -23.5505, lng: -46.6333, altitude: 10000, velocity: 800, heading: 45, threatLevel: 'SAFE', squawk: '7700', category: 1 },
  { id: 'TAM2002', originCountry: 'Brazil', lat: -22.9068, lng: -43.1729, altitude: 8000, velocity: 750, heading: 120, threatLevel: 'SAFE', squawk: '7700', category: 1 },
  { id: 'GLO3003', originCountry: 'Brazil', lat: -15.7942, lng: -47.8822, altitude: 11000, velocity: 820, heading: 10, threatLevel: 'SAFE', squawk: '7700', category: 1 },
  
  // 13 Voos normais (alguns com squawk normal, outros sem)
  { id: 'AZU1004', originCountry: 'Brazil', lat: -30.0346, lng: -51.2177, altitude: 9000, velocity: 700, heading: 180, threatLevel: 'SAFE', squawk: null, category: 1 },
  { id: 'TAM2005', originCountry: 'Brazil', lat: -19.9167, lng: -43.9345, altitude: 12000, velocity: 850, heading: 90, threatLevel: 'SAFE', squawk: null, category: 1 },
  { id: 'GLO3006', originCountry: 'Brazil', lat: -3.7319, lng: -38.5267, altitude: 10500, velocity: 780, heading: 270, threatLevel: 'SAFE', squawk: '1200', category: 1 },
  { id: 'AZU1007', originCountry: 'Brazil', lat: -8.0476, lng: -34.8770, altitude: 9500, velocity: 720, heading: 315, threatLevel: 'SAFE', squawk: '1200', category: 1 },
  { id: 'TAM2008', originCountry: 'Brazil', lat: -1.4550, lng: -48.5024, altitude: 11500, velocity: 810, heading: 135, threatLevel: 'SAFE', squawk: null, category: 1 },
  { id: 'GLO3009', originCountry: 'Brazil', lat: -12.9714, lng: -38.5014, altitude: 10000, velocity: 760, heading: 225, threatLevel: 'SAFE', squawk: '1200', category: 1 },
  { id: 'AZU1010', originCountry: 'Brazil', lat: -25.4284, lng: -49.2733, altitude: 8500, velocity: 710, heading: 15, threatLevel: 'SAFE', squawk: null, category: 1 },
  { id: 'TAM2011', originCountry: 'Brazil', lat: -27.5954, lng: -48.5480, altitude: 9200, velocity: 740, heading: 60, threatLevel: 'SAFE', squawk: '1200', category: 1 },
  { id: 'GLO3012', originCountry: 'Brazil', lat: -20.3155, lng: -40.3128, altitude: 11200, velocity: 830, heading: 105, threatLevel: 'SAFE', squawk: null, category: 1 },
  { id: 'AZU1013', originCountry: 'Brazil', lat: -5.7945, lng: -35.2110, altitude: 10800, velocity: 790, heading: 255, threatLevel: 'SAFE', squawk: '1200', category: 1 },
  { id: 'TAM2014', originCountry: 'Brazil', lat: -9.6662, lng: -35.7351, altitude: 9800, velocity: 730, heading: 330, threatLevel: 'SAFE', squawk: null, category: 1 },
  { id: 'GLO3015', originCountry: 'Brazil', lat: -16.6869, lng: -49.2648, altitude: 11800, velocity: 840, heading: 200, threatLevel: 'SAFE', squawk: '1200', category: 1 },
  { id: 'AZU1016', originCountry: 'Brazil', lat: 2.8235, lng: -60.6758, altitude: 10200, velocity: 770, heading: 165, threatLevel: 'SAFE', squawk: null, category: 1 },
];
