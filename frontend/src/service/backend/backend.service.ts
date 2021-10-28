import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

import { map } from 'rxjs/operators';

class Res {
  res: string;
  message: any;
}

@Injectable({
  providedIn: 'root'
})
export class BackendService {

  constructor(private http: HttpClient) { }

  private sendPost(body) {
    return this.http.post( environment.backend, body )
    .pipe( map(res => { return <Res>res;}) );
  }

  getDriveSize() {
    return this.sendPost({ op: 'getDriveSize'});
  }

  /**
   * 
   * @param room = id
   * @returns 
   */
  getRoom(room) {
    return this.sendPost({ op: 'getRoom', room: room });
  }

  /**
   * 
   * @returns 
   */
  getRooms() {
    return this.sendPost({ op: 'getRooms' });
  }

  /**
   * 
   * @param room { id, token, capacity, dateOff }
   * @returns 
   */
  roomOn(room) {
    return this.sendPost({ op: 'roomOn', room: room });
  }

  /**
   * 
   * @param room { id, token }
   * @returns 
   */
  roomOff(room) {
    return this.sendPost({ op: 'roomOff', room: room });
  }
}
