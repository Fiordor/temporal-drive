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

  noFiles: boolean = true;

  room: any = undefined;
  files: any[] = [];

  constructor(private route: ActivatedRoute, private roomService: RoomService,
    private socketService: SocketService, private router: Router) {

  }

  ngOnInit(): void {

    this.route.params.subscribe(params => {
      this.roomService.getRoom(params['id']).subscribe(res => {
        if (res.res == 'ok') {
          this.room = res.message;
          this.socketService.connectHasRoom(this.room.token).subscribe(() => {
            this.startListeners();
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

  startListeners() {
    this.socketService.updateFiles().subscribe(res => {
      console.log('updafiles');
      if (this.noFiles) {
        this.socketService.stopFirstUpdateFiles();
        this.noFiles = false;
        this.files = res;
      } else {
        console.log('updatefiles', res);
        res.forEach(outFile => {
          let localFile = this.files.find(f => f.name == outFile.name);
          if (localFile == undefined) {
            this.files.push(outFile);
          } else {
            if (localFile['perc'] != undefined) {
              localFile.path = outFile.path;
              delete localFile['perc'];
            }
          }
        });

        this.files.forEach((localFile, index) => {
          let outFile = res.findIndex(f => f.name == localFile.name);
          if (outFile == -1 && localFile['perc'] == undefined) {
            this.files.splice(index, 1);
          }
        });
      }
    });
  }

  goTo(path) { this.router.navigate([path]); }

  errorLoadingImg(event) { console.log(event); }

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

          const stringLength = 1024;

          let procLimit = base64.length / stringLength - 1;
          if (Math.trunc(procLimit) != procLimit) { procLimit = Math.trunc(procLimit) + 1; }

          let fileOnArray = {
            name: event.name,
            path: base64,
            perc: 0.0,
            proc: 0.0,
            procLimit: procLimit
          }

          this.files.push(fileOnArray);

          let i = 0;
          while (i < fileOnArray.procLimit) {
            let start = i * stringLength;
            let end = start + stringLength;
            data.base64 = base64.substring(i * stringLength, end);
            data.index = i++;
            this.socketService.uploadFile(data);
          }
          data.base64 = base64.substring(i * stringLength);
          data.index = i++;
          this.socketService.uploadFile(data);

          data.base64 = 'break';
          data.index = -1;
          this.socketService.uploadFile(data);
        }
      }
    });
  }

  deleteFile(file) {
    this.files.splice(this.files.findIndex(f => f.name == file.name), 1);
    this.socketService.deleteFile({ token: this.room.token, name: file.name });
  }
}
