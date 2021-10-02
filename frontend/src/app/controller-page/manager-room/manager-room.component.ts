import { Component, Input, OnInit } from '@angular/core';
import { BackendService } from 'src/service/backend/backend.service';

@Component({
  selector: 'app-manager-room',
  templateUrl: './manager-room.component.html',
  styleUrls: ['./manager-room.component.scss']
})
export class ManagerRoomComponent implements OnInit {

  @Input() room: any = undefined;

  token: string = '';
  capacity: number = null;
  days: number = null;
  time: string = '';

  constructor(private backendService: BackendService) { }

  ngOnInit(): void {
  }

  setCapacity(capacity) {
    //let localCapacity = capacity * 1048576;
    this.capacity = capacity;
  }

  changeStatus() {

    let millis = 0;
    millis = parseInt(this.time.split(':')[1]) * 60 * 1000;
    millis += parseInt(this.time.split(':')[0]) * 60 * 60 * 1000;
    millis += this.days * 24 * 60 * 60 * 1000;

    let room = {
      id: this.room.id,
      token: this.token,
      capacity: this.capacity * 1048576,
      timer: millis
    }

    this.backendService.roomOnOff(room).subscribe(res => {
      console.log(res);
    });
  }
}
