import { Injectable } from '@angular/core';
import { Socket } from 'ngx-socket-io';

@Injectable({
  providedIn: 'root'
})
export class SocketService {

  constructor(private socket: Socket) {
    /*
    console.log(socket);
    socket.connect();

    this.socket.on('connection', (data) => {
      console.log('connection', data);
    });
    */
  }
}
