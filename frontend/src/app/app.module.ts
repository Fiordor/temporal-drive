import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';
import { RoomComponent } from './room/room.component';
import { ControllerComponent } from './controller/controller.component';
import { LoginComponent } from './controller/login/login.component';
import { ManagerComponent } from './controller/manager/manager.component';

import { SocketIoModule, SocketIoConfig } from 'ngx-socket-io';
import { environment } from 'src/environments/environment';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { MatIconModule } from '@angular/material/icon'; 

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
    ManagerComponent
  ],
  imports: [
    CommonModule,
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    SocketIoModule.forRoot(config),
    BrowserAnimationsModule,
    MatIconModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
