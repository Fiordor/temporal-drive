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

  getRoom(room) {
    return this.sendPost({ op: 'getRoom', room: room });
  }

  getRooms() {
    return this.sendPost({ op: 'getRooms' });
  }

  roomOn(room) {
    return this.sendPost({ op: 'roomOn', room: room });
  }

  roomOff(room) {
    return this.sendPost({ op: 'roomOff', room: room });
  }
}
