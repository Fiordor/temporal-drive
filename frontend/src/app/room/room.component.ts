import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { RoomService } from 'src/service/room/room.service';
import { SocketService } from 'src/service/socket/socket.service';

@Component({
  selector: 'app-room',
  templateUrl: './room.component.html',
  styleUrls: ['./room.component.scss']
})
export class RoomComponent implements OnInit, OnDestroy {

  room: any = undefined;
  files: string[] = [];

  constructor(private route: ActivatedRoute, private roomService: RoomService,
    private socketService: SocketService, private router: Router) {

  }

  ngOnInit(): void {

    this.route.params.subscribe(params => {
      this.roomService.getRoom(params['id']).subscribe(res => {
        if (res.res == 'ok') {
          this.room = res.message;
          this.socketService.connectHasRoom(this.room.token);
          this.roomService.getFiles(this.room.token).subscribe(res => {
            this.files = res.message;
          });
        } else {
          this.goTo('/');
        }
      })
    });
  }

  ngOnDestroy(): void {
    this.socketService.disconnect();
  }

  goTo(path) { this.router.navigate([path]); }

  errorLoadingImg(event) {
    console.log(event);
  }

  uploadFile(event) {
    
    let file = {
      token: this.room.token,
      name: event.name,
      size: event.size,
    }

    this.roomService.canUploadFile(file).subscribe(res => {
      console.log(res);
      if (res.res == 'ok') {
        const reader = new FileReader();
        reader.readAsDataURL(event);
        reader.onload = () => {
          let base64 = <string>reader.result;
          let data = {
            token: this.room.token,
            name: event.name,
            base64: '',
            index: 0
          }

          const stringLength = 1024;
          let pointer = 0, index = 0;
          while (pointer + stringLength < base64.length) {
            data.base64 = base64.substring(pointer, pointer + stringLength);
            data.index = index++;
            this.socketService.uploadFile(data);
            pointer += stringLength;
            console.log(`${pointer / base64.length * 100}%`);
          }
          data.base64 = base64.substring(pointer, base64.length);
          data.index = index++;
          this.socketService.uploadFile(data);
          console.log(`${base64.length / base64.length * 100}%`);
          data.base64 = 'break';
          data.index = -1;
          this.socketService.uploadFile(data);
        }
      }
    });
  }

  deleteFile(file) {
    this.socketService.deleteFile({ token: this.room.token, name: file.name });
  }
}
