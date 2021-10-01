import { Component, OnInit } from '@angular/core';
import { BackendService } from 'src/service/backend/backend.service';
import { SocketService } from 'src/service/socket/socket.service';

@Component({
  selector: 'app-manager',
  templateUrl: './manager.component.html',
  styleUrls: ['./manager.component.scss']
})
export class ManagerComponent implements OnInit {

  rooms: any[];

  constructor(private backendService: BackendService, private socketService: SocketService) {
    this.rooms = [];
    for(let i = 0; i < 6; i++) {
      this.rooms[i] = { id: i+1 }
    }
  }

  ngOnInit(): void {
    this.backendService.getRooms().subscribe(res => {
      console.log(res.message);
    });
  }
}
