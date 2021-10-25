import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  room: string = '';

  constructor(private router: Router) { }

  ngOnInit(): void {
  }

  onKeydown(event) {
    if (event.key === "Enter") { this.join(); }
  }

  join() {
    console.log(this.room);
    this.router.navigate(['room', this.room]);
  }

}
