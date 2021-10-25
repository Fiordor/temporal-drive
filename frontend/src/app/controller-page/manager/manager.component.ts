import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { BackendService } from 'src/service/backend/backend.service';
import { ManagerService } from 'src/service/manager/manager.service';

@Component({
  selector: 'app-manager',
  templateUrl: './manager.component.html',
  styleUrls: ['./manager.component.scss']
})
export class ManagerComponent implements OnInit {

  idRoom: number = 0;

  rooms: any[] = [];

  constructor(private backendService: BackendService, private managerService: ManagerService,
    private router: Router) {
  }

  ngOnInit(): void {
    this.backendService.getRooms().subscribe(res => {
      this.rooms = res.message;
    });

    this.managerService.connect().subscribe(() => {
      this.managerService.joinOnRoom();
      this.listeners();
    });

  }

  goTo(path) { this.router.navigate([path]); }

  openRoom(id) { this.idRoom = id; }

  private listeners() {

  }
}
