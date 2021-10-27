import { Injectable } from '@angular/core';
import { Socket, SocketIoConfig } from 'ngx-socket-io';
import { Subject } from 'rxjs';

import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SocketService {

  readonly config: SocketIoConfig = {
    url: environment.socket,
    options: {
      transports: ['websocket'],
      autoConnect: false
    }
  };

  constructor(private socket: Socket) {}

  connect() {
    let subject = new Subject<any>();
    this.socket = new Socket(this.config);
    this.socket.connect();
    this.socket.on('connect', () => {
      subject.next();
      console.log('socket id:', this.socket.ioSocket.id);
    });
    return subject;
  }

  joinOnRoom(token) {
    let subject = new Subject<any>();
    this.socket.fromOneTimeEvent('update-first-files').then(res => { subject.next(res); });
    this.socket.emit('join-on-room', token);
    return subject;
  }

  disconnect() {
    this.socket.removeAllListeners();
    this.socket.disconnect();
    this.socket = null;
  }

  canUploadFile(fileInfo) {
    this.socket.emit('can-upload-file', fileInfo);
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

  requestRoomInfo(room) {
    let subject = new Subject<any>();
    this.socket.fromOneTimeEvent('get-room').then(res => { subject.next(res); });
    this.socket.emit('request-room-info', room);
    return subject;
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
   * Escucha cuando un archivo se confirma que se puede subir
   * 
   * @returns { yes: boolean, id: toke + fileName }
   */
  fileCanBeUploaded() {
    return this.socket.fromEvent('file-can-be-uploaded').pipe( map( (data) => { return <any>data; } ) );
  }

  updateSizes() {
    return this.socket.fromEvent('update-sizes').pipe( map( (data) => { return <any>data; } ) );
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
