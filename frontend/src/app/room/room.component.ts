import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { RoomService } from 'src/service/room/room.service';
import { SocketService } from 'src/service/socket/socket.service';

import { saveAs } from 'file-saver';

@Component({
  selector: 'app-room',
  templateUrl: './room.component.html',
  styleUrls: ['./room.component.scss']
})
export class RoomComponent implements OnInit, OnDestroy {

  noFiles: boolean = true;

  room: any = { token: '' };
  files: any[] = [];
  filesWaitingForUpload: any[] = [];

  constructor(private route: ActivatedRoute, private roomService: RoomService,
    private socketService: SocketService, private router: Router) {

  }

  ngOnInit(): void {

    this.route.params.subscribe(params => {
      this.socketService.connect().subscribe(() => {
        this.startListeners();
        this.socketService.requestRoomInfo(params['id']);
        this.socketService.joinOnRoom(params['id']);
      });
    });
  }

  ngOnDestroy(): void {
    this.socketService.disconnect();
  }

  startListeners() {
    this.socketService.getRoom().subscribe(res => {
      this.room = res;
    });

    this.socketService.fileCanBeUploaded().subscribe(res => {
      this.listenerFileCanBeUploaded(res);
    });

    this.socketService.updateFiles().subscribe(res => {
      this.listenerUpdatesFiles(res);
    });

    this.socketService.updateFileState().subscribe(res => {
      this.listenerUpdateFileState(res);
    });
  }

  goTo(path) {
    this.router.navigate([path]);
  }

  errorLoadingImg(event) {
    console.log(event);
  }

  openFile(file) {
    file['open'] = 1;
  }

  closeFile(file) {
    if (file['open'] != undefined) {
      file['open'] = --file['open'];
      if (file['open'] < 0) { delete file['open']; }
    }
  }

  downloadFile(file) {
    async function save(file: any) {
      saveAs(file.path, file.name);
    }
    save(file);
  }

  uploadFile(event) {

    let fileInfo = {
      token: this.room.token,
      name: event.name,
      size: event.size
    }
    let id = fileInfo.token + fileInfo.name;

    this.filesWaitingForUpload[id] = event;
    this.socketService.canUploadFile(fileInfo);
  }

  deleteFile(file) {
    this.files.splice(this.files.findIndex(f => f.name == file.name), 1);
    this.socketService.deleteFile({ token: this.room.token, name: file.name });
  }

  private listenerFileCanBeUploaded(response) {
    
    let event = this.filesWaitingForUpload[response.id];
    delete this.filesWaitingForUpload[response.id];

    if (!response.yes) { return; }
    
    const reader = new FileReader();
    reader.readAsDataURL(event);
    reader.onload = () => {

      let base64 = <string>reader.result;
      const stringLength = 1024;

      let procLimit = base64.length / stringLength - 1;
      if (Math.trunc(procLimit) != procLimit) { procLimit = Math.trunc(procLimit) + 1; }

      let data = {
        token: this.room.token,
        name: event.name,
        payload: '',
        index: 0
      }

      let fileControl = {
        name: event.name,
        path: base64,
        perc: 0.0,
        proc: 0.0,
        procLimit: procLimit
      }

      this.files.push(fileControl);

      let i = 0;
      while (i < fileControl.procLimit) {
        let start = i * stringLength;
        let end = start + stringLength;
        data.payload = base64.substring(i * stringLength, end);
        data.index = i++;
        this.socketService.uploadFile(data);

        fileControl.perc = Math.trunc((i / fileControl.procLimit) * 100);
      }
      data.payload = base64.substring(i * stringLength);
      data.index = i++;
      this.socketService.uploadFile(data);

      fileControl.perc = Math.trunc((i / fileControl.procLimit) * 100);

      data.payload = 'break';
      data.index = -1;
      this.socketService.uploadFile(data);
    }
  }

  private listenerUpdatesFiles(inComingFiles) {
    if (this.noFiles) {
      this.socketService.stopFirstUpdateFiles();
      this.files = inComingFiles;
      this.noFiles = false;
    } else {
      inComingFiles.forEach(inComingFile => {
        let localFile = this.files.find(f => f.name == inComingFile.name);
        if (localFile == undefined) {
          this.files.push(inComingFile);
        } else if (localFile['perc'] != undefined) {
          localFile.path = inComingFile.path;
          delete localFile['perc'];
        }
      });

      this.files.forEach((localFile, index) => {
        let inComingFile = inComingFiles.findIndex(f => f.name == localFile.name);
        if (inComingFile == -1 && localFile['perc'] == undefined) {
          this.files.splice(index, 1);
        }
      });
    }
  }

  private listenerUpdateFileState(fileToUpdate) {
    let i = this.files.findIndex(f => f.name == fileToUpdate.name);
    if (i > -1 && this.files[i]['proc'] != undefined) {
      let perc = (fileToUpdate.index / this.files[i].procLimit) * 100;
      this.files[i].proc = Math.trunc(perc);
    }
  }
}
