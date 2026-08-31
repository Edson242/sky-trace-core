import { Server, Socket } from 'socket.io';
import { RouteDeviationPayload } from './socket.types';

export let connectedClients: number = 0;

export function initializeSocketGateway(io: Server): void {
  io.on('connection', (socket: Socket): void => {
    connectedClients++;
    console.log(`[Socket] Operador conectado. ID: ${socket.id} | Total: ${connectedClients}`);

    socket.on('select_flight', (data: { flightId: string }): void => {
      console.log(`[Socket] Operador solicitou detalhes do voo ${data.flightId}`);
    });

    socket.on('issue_route_deviation', (data: RouteDeviationPayload): void => {
      console.log(`[ALERTA TÁTICO] Desvio emitido para ${data.flightId}. Motivo: ${data.reason}`);
      io.emit('tactical_update', { message: `Voo ${data.flightId} desviado.` });
    });

    socket.on('disconnect', (): void => {
      connectedClients--;
      console.log(`[Socket] Operador desconectado. ID: ${socket.id} | Total: ${connectedClients}`);
    });
  });
}