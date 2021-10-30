import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlertService } from 'src/service/alert/alert.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  room: string = '';

  constructor(private router: Router, private alertService: AlertService) { }

  ngOnInit(): void {
  }

  onKeydown(event) {
    if (event.key === "Enter") { this.join(); }
  }

  join() {
    if (this.room.trim().length > 0) {
      this.router.navigate(['room', this.room]);
    } else {
      this.alertService.print('Introduzca un código de sala');
    }
  }
}
