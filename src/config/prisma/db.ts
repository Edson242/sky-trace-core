import 'dotenv/config';
import postgres from '@prisma/orm-postgres/runtime';
import type { Contract } from './schema.d';
import contractJson from './schema.json';

export const db = postgres<Contract>({
  contractJson,
  url: process.env['DATABASE_URL']!,
  poolOptions: {
    connectionTimeoutMillis: 2000, // Falha rápido se o banco estiver fora
  },
});
