import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { RoomService } from 'src/service/room/room.service';
import { SocketService } from 'src/service/socket/socket.service';

@Component({
  selector: 'app-room',
  templateUrl: './room.component.html',
  styleUrls: ['./room.component.scss']
})
export class RoomComponent implements OnInit, OnDestroy {

  room: any = undefined;

  constructor(private route: ActivatedRoute, private roomService: RoomService,
    private socketService: SocketService) {

  }

  ngOnInit(): void {

    this.route.params.subscribe(params => {
      this.roomService.getRoom(params['id']).subscribe(res => {
        if (res.res == 'ok') {
          this.room = res.message;
          this.socketService.connectHasRoom();
        }
      })
    });
  }

  ngOnDestroy(): void {
    this.socketService.disconnect();
  }

  uploadFile(event) {
    
    let file = {
      token: this.room.token,
      name: event.name,
      size: event.size,
    }

    this.roomService.canUploadFile(file).subscribe(res => {
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

          const stringLength = 1 * 1024;
          let pointer = 0, index = 0;
          while (pointer + stringLength < base64.length) {
            data.base64 = base64.substring(pointer, pointer + stringLength);
            data.index = index++;
            this.socketService.uploadFile(data);
            pointer += stringLength;
          }
          data.base64 = base64.substring(pointer, base64.length);
          data.index = index++;
          this.socketService.uploadFile(data);
          this.socketService.uploadFile('break');
        }
      }
    });
  }
}
