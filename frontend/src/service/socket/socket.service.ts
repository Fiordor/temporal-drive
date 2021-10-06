import { Injectable } from '@angular/core';
import { Socket } from 'ngx-socket-io';

@Injectable({
  providedIn: 'root'
})
export class SocketService {

  constructor(private socket: Socket) {
  }

  connectHasRoom(token) {
    this.socket.connect();

    this.socket.on('connect', () => {
      this.socket.emit('join-on-room', token);
      console.log(`connect ${this.socket.ioSocket.id} on ${token}`);
    });
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
}
