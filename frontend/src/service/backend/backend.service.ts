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

  getRooms() {

    const body = { op: 'getRooms' };

    return this.http.post( environment.backend, body )
    .pipe( map(res => { return <Res>res;}) );
  }
}
