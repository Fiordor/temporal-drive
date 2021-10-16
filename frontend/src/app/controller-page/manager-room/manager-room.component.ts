import { Component, Input, OnInit } from '@angular/core';
import { BackendService } from 'src/service/backend/backend.service';

@Component({
  selector: 'app-manager-room',
  templateUrl: './manager-room.component.html',
  styleUrls: ['./manager-room.component.scss']
})
export class ManagerRoomComponent implements OnInit {

  readonly CAPACITY_AVAILABLES = [ 128, 256, 384, 512, 640, 768, 896, 1024 ];
  readonly TIME_AVAILABLES = [ '00:05', '00:10', '00:15', '00:30', '00:45', '01:00', '02:00', '04:00', '08:00', '16:00' ];
  readonly DAY_AVAILABLES = [ '1', '2', '7', '14', '30' ];

  @Input() room: any = undefined;

  token: string = '';
  capacity: number = null;
  days: string = '';
  time: string = '';

  constructor(private backendService: BackendService) { }

  ngOnInit(): void {
  }

  generateRandomToken() {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    this.token = '';

    for (var i = 0; i < 8; i++) {
      let integer = Math.floor(Math.random() * charactersLength);
      this.token += characters.charAt(integer);
    }
  }

  setCapacity(capacity) {
    this.capacity = capacity;
  }

  setDay(days) {
    this.days = days;
    this.time = '';
  }

  setTime(time) {
    this.days = '';
    this.time = time;
  }

  changeStatus() {
    if (this.room.openRoom) {
      this.powerOffRoom();
    } else {
      this.powerOnRoom();
    }
  }

  private powerOnRoom() {
    /*
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
    */
  }

  private powerOffRoom() {

    let room = {
      id: this.room.id,
      token: this.room.token
    }

    this.backendService.roomOff(room).subscribe(res => {
      console.log(res);
    });

  }
}
