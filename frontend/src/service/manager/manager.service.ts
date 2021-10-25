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

    this.socket.on('connect', () => { subject.next(); });

    return subject;
  }

  joinOnRoom() {
    this.socket.emit('join-on-room', 'manager');
  }
}
