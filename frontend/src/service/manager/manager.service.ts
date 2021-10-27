import { Injectable } from '@angular/core';
import { Socket } from 'ngx-socket-io';
import { Subject } from 'rxjs';

import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ManagerService {

  constructor(private socket: Socket) {
  }

  connect() {
    
    let subject = new Subject<any>();
    this.socket.connect();

    this.socket.on('connect', () => {
      subject.next();
      console.log('socket id:', this.socket.ioSocket.id);
    });

    return subject;
  }

  disconnect() {
    this.socket.removeAllListeners();
    this.socket.disconnect();
  }

  joinOnRoom() {
    this.socket.emit('join-on-room', 'manager');
  }

  updateSizes() {
    return this.socket.fromEvent('update-sizes-manager').pipe( map( (data) => { return <any>data; } ) );
  }
}
