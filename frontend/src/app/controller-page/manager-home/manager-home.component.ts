import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-manager-home',
  templateUrl: './manager-home.component.html',
  styleUrls: ['./manager-home.component.scss']
})
export class ManagerHomeComponent implements OnInit {

  @Input() rooms: any[] = [];
  @Output() openRoom = new EventEmitter();

  constructor() { }

  ngOnInit(): void {
  }

  clickOpenRoom(id) {
    this.openRoom.emit(id);
  }
}
