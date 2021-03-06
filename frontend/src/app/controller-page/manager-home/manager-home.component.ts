import { Component, EventEmitter, Input, OnChanges, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-manager-home',
  templateUrl: './manager-home.component.html',
  styleUrls: ['./manager-home.component.scss']
})
export class ManagerHomeComponent implements OnInit, OnChanges {

  @Input() rooms: any[] = [];
  @Output() openRoom = new EventEmitter();

  constructor() { }

  ngOnInit(): void { }

  ngOnChanges(): void {
    if (this.rooms.length > 0)
    console.log('rooms', this.rooms);
  }

  busyToString(busy) {
    return (busy) ? busy + '%' : '';
  }

  capacityToString(capacity) {
    return capacity ? capacity + ' MB' : '';
  }

  dateOffToString(k, millis) {
    if (millis) {
      let st = new Date(millis).toLocaleString();
      let split = st.split(' ');
      return split[k]
    } else {
      return '';
    }
  }

  clickOpenRoom(id) {
    this.openRoom.emit(id);
  }
}
