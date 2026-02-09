import {Injectable, OnDestroy} from '@angular/core';
import {BehaviorSubject, distinctUntilChanged, EMPTY, Observable, switchMap} from 'rxjs';
import {Client, IMessage, StompSubscription} from '@stomp/stompjs';

export enum SocketClientState {
  ATTEMPTING = 0,
  CONNECTED = 1,
  DISCONNECTED = 2,
}

@Injectable({
  providedIn: 'root'
})
export class WebsocketService {

  private client: Client;
  private state: BehaviorSubject<SocketClientState>;
  private topicSubscriptions: Map<string, StompSubscription> = new Map();
  private connected = false;
  private SOCKET_SERVER_URL = `https://socket.easypos.vn/ws`;

  constructor() {
    // Initialize BehaviorSubject with initial state DISCONNECTED
    this.state = new BehaviorSubject<SocketClientState>(SocketClientState.DISCONNECTED);

    this.client = new Client({
      brokerURL: this.SOCKET_SERVER_URL,
      // Auto reconnect after 5 seconds if connection is lost
      reconnectDelay: 5000,
      // Heartbeat to keep connection (milliseconds)
      heartbeatIncoming: 5000,
      heartbeatOutgoing: 5000,
      onConnect: () => {
        this.connected = true;
        this.state.next(SocketClientState.CONNECTED);
      },
      onStompError: () => {
        this.connected = false;
        this.state.next(SocketClientState.DISCONNECTED);
      },
      onWebSocketClose: () => {
        this.connected = false;
        this.state.next(SocketClientState.DISCONNECTED);
        // this.clearSubscriptions(); // Delete subscriptions when websocket closes
      },
      onWebSocketError: () => {
        this.connected = false;
        this.state.next(SocketClientState.DISCONNECTED);
      },
    });
  }

  // Observable to track connection status
  onState(): Observable<SocketClientState> {
    return this.state.asObservable();
  }

  // Function to connect to WebSocket server
  connect(): void {
    if (this.state.value === SocketClientState.CONNECTED || this.state.value === SocketClientState.ATTEMPTING) {
      return;
    }
    this.state.next(SocketClientState.ATTEMPTING);
    this.client.activate();
  }

  disconnect(): void {
    if (this.client.active) {
      this.client
        .deactivate()
        .then(() => {
          this.state.next(SocketClientState.DISCONNECTED);
          this.clearSubscriptions(); // Delete subscriptions when actively disconnected
        })
        .catch(() => {
          this.state.next(SocketClientState.DISCONNECTED);
          this.clearSubscriptions();
        });
    } else {
      // Make sure the status is disconnected if not active
      if (this.state.value !== SocketClientState.DISCONNECTED) {
        this.state.next(SocketClientState.DISCONNECTED);
        this.clearSubscriptions();
      }
    }
  }

  // Subscribe to a topic and return an Observable so that the component can receive messages from this topic
  // noinspection JSUnusedGlobalSymbols
  subscribeToTopic(topic: string): Observable<IMessage> {
    // Wait until the client connects successfully
    return this.state.pipe(
      distinctUntilChanged(),
      switchMap(state => {
        if (state !== SocketClientState.CONNECTED) {
          return EMPTY;
        }

        return new Observable<IMessage>(observer => {
          const subscription = this.client.subscribe(topic, (message: IMessage) => {
            observer.next(message);
          });

          this.topicSubscriptions.set(topic, subscription);

          return () => {
            subscription.unsubscribe();
            this.topicSubscriptions.delete(topic);
          };
        });
      })
    );
  }

  // noinspection JSUnusedGlobalSymbols
  unsubscribeFromTopic(topic: string): void {
    const subscription = this.topicSubscriptions.get(topic);

    if (subscription) {
      subscription.unsubscribe();
      this.topicSubscriptions.delete(topic);
    }
  }

  // Function to send message to server (STOMP)
  // Destination must start with prefix configured in backend (`/api/websocket/`)
  // noinspection JSUnusedGlobalSymbols
  sendMessage(destination: string, body: any): void {
    if (this.client.active) {
      this.client.publish({
        destination: destination,
        body: JSON.stringify(body), // Convert content to JSON
      });
    }
  }

  private clearSubscriptions(): void {
    this.topicSubscriptions.forEach(sub => sub.unsubscribe());
    this.topicSubscriptions.clear();
  }

  isConnected(): boolean {
    return this.connected;
  }


}
