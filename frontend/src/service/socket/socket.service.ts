import { Injectable } from '@angular/core';
import { Socket } from 'ngx-socket-io';
import { Subject } from 'rxjs';

import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class SocketService {

  constructor(private socket: Socket) {
  }

  connectHasRoom(token) {

    let subject = new Subject<any>()

    this.socket.connect();

    this.socket.on('connect', () => {
      this.socket.emit('join-on-room', token);
      console.log(`connect ${this.socket.ioSocket.id} on ${token}`);
      subject.next();
    });

    return subject;
  }

  disconnect() {
    this.socket.disconnect();
  }

  /**
   * Sube los datos de la imagen.
   * Cuando el index = -1 y base64 = 'break' indica que ha terminado de subir
   * datos.
   * 
   * @param data { token, name, base64, index }
   */
  uploadFile(data) {
    this.socket.emit('upload-file', data);
  }

  /**
   * Elimina la imagen.
   * 
   * @param fileObject { token, name }
   */
  deleteFile(fileObject) {
    this.socket.emit('delete-file', fileObject);
  }

  stopFirstUpdateFiles() {
    this.socket.emit('stop-first-update-files');
  }

  /**
   * Escucha evento cuando se actualiza la tabla box.
   * 
   * @returns [ { path, name }, ... ]
   */
  updateFiles() {
    return this.socket.fromEvent('update-files').pipe( map( (data) => { return <any>data; } ) );
  }

  updateFileState() {
    return this.socket.fromEvent('update-file-state').pipe( map( (data) => { return <any>data; } ) );
  }
}
