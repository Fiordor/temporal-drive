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
export class RoomService {

  constructor(private http: HttpClient) { }

  private sendPost(body) {
    return this.http.post( environment.backend, body )
    .pipe( map(res => { return <Res>res;}) );
  }

  getFiles(token) {
    return this.sendPost({ op: 'getFiles', token: token });
  }

  getRoom(token) {
    return this.sendPost({ op: 'getRoom', token: token });
  }

  canUploadFile(file) {
    return this.sendPost({ op: 'canUploadFile', file: file });
  }
}
