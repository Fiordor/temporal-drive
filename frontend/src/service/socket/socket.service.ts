import { Injectable } from '@angular/core';
import { Socket } from 'ngx-socket-io';

@Injectable({
  providedIn: 'root'
})
export class SocketService {

  constructor(private socket: Socket) {
  }

  connectHasRoom() {
    this.socket.connect();

    this.socket.on('connect', () => {
      console.log('connection', this.socket.ioSocket.id);
    });
  }

  disconnect() {
    this.socket.disconnect();
  }

  uploadFile(data) {
    this.socket.emit('upload-file', data);
  }
}
