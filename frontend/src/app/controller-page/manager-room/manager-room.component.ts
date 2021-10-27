import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { BackendService } from 'src/service/backend/backend.service';

@Component({
  selector: 'app-manager-room',
  templateUrl: './manager-room.component.html',
  styleUrls: ['./manager-room.component.scss']
})
export class ManagerRoomComponent implements OnInit, OnChanges {

  CAPACITY_AVAILABLES = [];
  TIME_AVAILABLES = [ '00:05', '00:10', '00:15', '00:30', '00:45', '01:00', '02:00', '04:00', '08:00', '16:00' ]
  DAY_AVAILABLES = [ '1', '2', '7', '14', '30' ];

  @Input() id: number = 0;
  @Input() rooms: any[] = [];

  room : any = { id: 0, openRoom: 0 };

  token: string = '';
  capacity: number = 0;
  days: string = '0';
  time: string = '00:00';

  dateOn: string = '-';
  dateOff: string = '-';

  constructor(private backendService: BackendService) { }

  ngOnInit(): void {
    this.setRoomOnLocal(this.rooms[this.id - 1]);
    this.setCapacities();
  }

  ngOnChanges(): void {
    console.log('changes');
    console.log(this.rooms);
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

  private setRoomOnLocal(room) {

    this.room = room;
    this.token = room.token;
    this.capacity = room.capacity / (1024 * 1024);
    
    if (room.openRoom) {
      this.dateOn = new Date(room.dateOn).toUTCString();
      this.dateOff = new Date(room.dateOff).toUTCString();
    } else {
      this.dateOn = '-';
      this.dateOff = '-';
    }
  }

  private powerOnRoom() {

    //if (this.room.tokens.find(t => t == this.token) != undefined) { return; }
    if (this.capacity == 0) { return; }
    if (this.days.length == 0 && this.time.length == 0) { return; }

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
      if (res.res == 'ok') { this.setRoomOnLocal(res.message); }
    });
  }

  private powerOffRoom() {

    let room = {
      id: this.room.id,
      token: this.room.token
    }

    this.backendService.roomOff(room).subscribe(res => {
      if (res.res == 'ok') { this.setRoomOnLocal(res.message); }
    });
  }
}
