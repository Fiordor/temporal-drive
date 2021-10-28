import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BackendService } from 'src/service/backend/backend.service';

@Component({
  selector: 'app-manager-room',
  templateUrl: './manager-room.component.html',
  styleUrls: ['./manager-room.component.scss']
})
export class ManagerRoomComponent implements OnInit {

  CAPACITY_AVAILABLES: any = [];
  TIME_AVAILABLES: string[] = [ '00:05', '00:10', '00:15', '00:30', '00:45', '01:00', '02:00', '04:00', '08:00', '16:00' ]
  DAY_AVAILABLES: string[] = [ '1', '2', '7', '14', '30' ];

  @Input() id: number = 0;
  @Input() rooms: any[] = [];

  room : any = { id: 0, openRoom: 0, dateOn: 0, dateOff: 0 };

  token: string = '';
  capacity: number = 0;
  days: string = '0';
  time: string = '00:00';

  constructor(private backendService: BackendService, private _snackBar: MatSnackBar) { }

  ngOnInit(): void {
    this.setRoomOnLocal(this.rooms[this.id - 1]);
    this.setCapacities();
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
    console.log(capacity);
    this.capacity = capacity;
  }

  setDay(days) {
    this.days = days;
    this.time = '00:00';
  }

  setTime(time) {
    this.days = '0';
    this.time = time;
  }

  dateToString(millis) {
    return this.room.openRoom ? new Date(millis).toLocaleString() : '-';
  }

  busyToString() {
    if (this.room.openRoom) {
      return `${this.room.busy}B / ${this.room.capacity}B ${this.room.busy_perc}%`
    } else {
      return '-';
    }
  }

  changeStatus() {
    if (this.room.openRoom) {
      this.powerOffRoom();
    } else {
      this.powerOnRoom();
    }
  }

  private setCapacities() {
    const SIZES = [ 128, 256, 384, 512, 640, 768, 896, 1024 ];
    let localSizes = [];
    let maxSize = 1024;

    this.rooms.forEach(room => { maxSize -= room.capacity / (1024 * 1024); });

    SIZES.forEach(size => {
      localSizes.push( { value: size, enable: size <= maxSize } );
    });
    this.CAPACITY_AVAILABLES = localSizes;
  }

  private setRooms(room) {
    let index = this.rooms.findIndex(r => r.id == room.id);
    if (index > -1) { this.rooms[index] = room; }
    this.setCapacities();
    this.setRoomOnLocal(room);
  }

  private setRoomOnLocal(room) {

    this.room = room;
    this.token = room.token;
    this.capacity = room.capacity / (1024 * 1024);

    console.log('room', this.room);
    console.log('rooms', this.rooms);
  }

  private openSnackBar(message: string) {
    this._snackBar.open(message, 'OK');
  }

  private powerOnRoom() {

    if (this.rooms.find(r => r.token == this.token) != undefined) {
      this.openSnackBar('El token ya existe');
      return;
    }
    if (this.capacity == 0) {
      this.openSnackBar('Falta la capacidad de la sala');
      return;
    }
    if (this.days.length == 0 && this.time.length == 0) {
      this.openSnackBar('Necesita un tiempo límite');
      return;
    }

    let millis = 0;
    millis += parseInt(this.time.split(':')[0]) * 60 * 60 * 1000;
    millis += parseInt(this.time.split(':')[1]) * 60 * 1000;
    millis += parseInt(this.days) * 24 * 60 * 60 * 1000;

    let room = {
      id: this.room.id,
      token: this.token,
      capacity: this.capacity,
      dateOff: millis
    }

    this.backendService.roomOn(room).subscribe(res => {
      if (res.res == 'ok') { this.setRooms(res.message); }
    });
  }

  private powerOffRoom() {

    let room = {
      id: this.room.id,
      token: this.room.token
    }

    this.backendService.roomOff(room).subscribe(res => {
      if (res.res == 'ok') { this.setRooms(res.message); }
    });
  }
}
