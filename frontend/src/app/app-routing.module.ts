import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ControllerComponent } from './controller-page/controller/controller.component';
import { HomeComponent } from './home/home.component';
import { RoomComponent } from './room/room.component';

const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'controller', component: ControllerComponent },
  { path: 'room', component: RoomComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
