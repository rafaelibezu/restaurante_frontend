import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Client, IMessage } from '@stomp/stompjs';
import { Notificacion } from '../models/notification';
import { environment } from '../../../environments/environment.prod';

@Injectable({
  providedIn: 'root'
})
export class WebsocketNotificacionService {

  private stompClient?: Client;
  private conectando = false;

  private nuevaNotificacionSubject = new BehaviorSubject<Notificacion | null>(null);
  nuevaNotificacion$ = this.nuevaNotificacionSubject.asObservable();

  conectar(): void {
    if (this.stompClient?.active || this.conectando) {
      return;
    }

    this.conectando = true;
    void this.iniciarConexion();
  }

  private async iniciarConexion(): Promise<void> {
    try {
      (globalThis as any).global ??= globalThis;
      const SockJS = (await import('sockjs-client')).default as any;

      this.stompClient = new Client({
        webSocketFactory: () => new SockJS(environment.wsUrl),
        reconnectDelay: 5000,

        onConnect: () => {
          this.conectando = false;
          console.log('WebSocket conectado');

          this.stompClient?.subscribe('/topic/notificaciones', (message: IMessage) => {
            const notificacion: Notificacion = JSON.parse(message.body);
            this.nuevaNotificacionSubject.next(notificacion);
          });
        },

        onStompError: frame => {
          this.conectando = false;
          console.error('Error STOMP:', frame);
        },

        onWebSocketError: error => {
          this.conectando = false;
          console.error('Error WebSocket:', error);
        }
      });

      this.stompClient.activate();
    } catch (error) {
      this.conectando = false;
      console.error('No se pudo inicializar SockJS:', error);
    }
  }

  desconectar(): void {
    this.conectando = false;
    this.stompClient?.deactivate();
  }
}
