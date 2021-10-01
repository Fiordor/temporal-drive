import { Component, OnInit } from '@angular/core';
import { BackendService } from 'src/service/backend/backend.service';
import { SocketService } from 'src/service/socket/socket.service';

@Component({
  selector: 'app-manager',
  templateUrl: './manager.component.html',
  styleUrls: ['./manager.component.scss']
})
export class ManagerComponent implements OnInit {

  constructor(private backendService: BackendService, private socketService: SocketService) { }

  ngOnInit(): void {
    this.backendService.getRooms().subscribe(res => {
      console.log(res.message);
    });
  }
}
