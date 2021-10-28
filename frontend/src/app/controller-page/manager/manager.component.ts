import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { BackendService } from 'src/service/backend/backend.service';
import { ManagerService } from 'src/service/manager/manager.service';

@Component({
  selector: 'app-manager',
  templateUrl: './manager.component.html',
  styleUrls: ['./manager.component.scss']
})
export class ManagerComponent implements OnInit, OnDestroy {

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

  ngOnDestroy(): void {
    this.managerService.disconnect();
  }

  goTo(path) { this.router.navigate([path]); }

  closeRoom(token) {
    this.managerService.closeRoom(token);
  }

  openRoom(id) { this.idRoom = id; }

  private listeners() {

    this.managerService.updateSizes().subscribe(res => {
      console.log(res);
      let index = this.rooms.findIndex(r => r.token == res.token);
      if (index > -1) {
        this.rooms[index].busy = res.busy;
        this.rooms[index].busy_perc = res.busy_perc;
      }
    });
  }
}
