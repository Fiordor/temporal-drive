import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';

import { SocketIoModule, SocketIoConfig } from 'ngx-socket-io';
import { environment } from 'src/environments/environment';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';
import { RoomComponent } from './room/room.component';
import { ControllerComponent } from './controller-page/controller/controller.component';
import { LoginComponent } from './controller-page/login/login.component';
import { ManagerComponent } from './controller-page/manager/manager.component';
import { ManagerHomeComponent } from './controller-page/manager-home/manager-home.component';
import { ManagerRoomComponent } from './controller-page/manager-room/manager-room.component';

import {MatButtonModule} from '@angular/material/button'; 
import {MatIconModule} from '@angular/material/icon'; 
import {MatToolbarModule} from '@angular/material/toolbar'; 
import {MatProgressBarModule} from '@angular/material/progress-bar'; 
import {MatCardModule} from '@angular/material/card';
import {MatSnackBarModule} from '@angular/material/snack-bar';
import {MatMenuModule} from '@angular/material/menu'; 

const config: SocketIoConfig = {
  url: environment.socket,
  options: {
    transports: ['websocket'],
    autoConnect: false
  }
};

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    RoomComponent,
    ControllerComponent,
    LoginComponent,
    ManagerComponent,
    ManagerHomeComponent,
    ManagerRoomComponent
  ],
  imports: [
    CommonModule,
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    SocketIoModule.forRoot(config),
    BrowserAnimationsModule,
    MatIconModule,
    MatButtonModule,
    MatToolbarModule,
    MatProgressBarModule,
    MatCardModule,
    MatSnackBarModule,
    MatMenuModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
