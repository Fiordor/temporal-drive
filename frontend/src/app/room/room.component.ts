import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SocketService } from 'src/service/socket/socket.service';

import { saveAs } from 'file-saver';
import { animate, keyframes, state, style, transition, trigger } from '@angular/animations';

@Component({
  selector: 'app-room',
  templateUrl: './room.component.html',
  styleUrls: ['./room.component.scss'],
  animations: [
    trigger('closeButton', [
      state('true', style({ top: '20px', left: '20px' })),
      state('false', style({ top: '-40px', left: '-40px' })),
      transition('true <=> false', [ animate('0.2s') ])
    ]),
    trigger('imgBackground', [
      state('true', style({ position: 'fixed', 'z-index': 10, width: '100%', height: '100%' })),
      state('false', style({ position: 'absolute' })),
      transition('false => true', [
        animate('0.2s', keyframes([
          style({ position: 'fixed', 'z-index': 10, width: '0px', height: '0px', offset: 0 }),
          style({ width: '100%', height: '100%', offset: 1 })
        ]))
      ]),
      transition('true => false', [
        animate('0.2s', keyframes([
          style({ width: '0px', height: '0px', offset: 1 })
        ]))
      ])
    ]),
    trigger('mainImg', [
      state('true', style({ position: 'fixed', 'z-index': 11 })),
      state('false', style({ position: 'absolute' })),
      transition('false => true', [
        animate('0.2s', keyframes([
          style({ position: 'fixed', 'z-index': 11, width: '0px', height: '0px', offset: 0 }),
          style({ width: 'auto', height: 'auto', 'max-width': '100%', 'max-height': '100%', offset: 1 })
        ]))
      ])
    ])
  ]
})
export class RoomComponent implements OnInit, OnDestroy {

  room: any = { token: '' };
  files: any[] = [];
  filesWaitingForUpload: any[] = [];

  constructor(private route: ActivatedRoute, private socketService: SocketService,
    private router: Router) {
  }

  ngOnInit(): void {

    this.route.params.subscribe(params => {
      let token = params['id'];
      this.socketService.connect().subscribe(() => {
        this.socketService.requestRoomInfo(token).subscribe(res => {
          if (res) {
            this.room = res;
            this.joinOnRoom();
          } else {
            this.router.navigate(['/']);
          }
        });
      });
    });

    this.startListeners();
  }

  ngOnDestroy(): void {
    this.socketService.disconnect();
  }

  startListeners() {

    this.socketService.closeRoom().subscribe(() => {
      this.router.navigate(['/']);
    });

    this.socketService.fileCanBeUploaded().subscribe(res => {
      this.listenerFileCanBeUploaded(res);
    });

    this.socketService.updateSizes().subscribe(res => {
      this.listenerUpdateSizes(res);
    });

    this.socketService.updateFiles().subscribe(res => {
      this.listenerUpdateFiles(res);
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
    if (file['perc'] == undefined) {
      file['open'] = 1;
    }
  }

  openOrCloseFile(file) {
    if (file['perc'] == undefined) {
      if (file['open'] == undefined) { file['open'] = 1; }
      else { delete file['open']; }
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

  private joinOnRoom() {
    this.socketService.joinOnRoom(this.room.token).subscribe(res => {
      this.files = res;
    });
  }

  private listenerFileCanBeUploaded(response) {

    console.log('listenerFileCanBeUploaded');
    console.log(this.filesWaitingForUpload);

    let event = this.filesWaitingForUpload[response.id];
    delete this.filesWaitingForUpload[response.id];

    if (!response.yes) { console.log('no se puede subir el archivo'); return; }

    const reader = new FileReader();
    console.log(event);
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

  private listenerUpdateSizes(sizes) {
    this.room.busy = sizes.busy;
    this.room.busy_perc = sizes.busy_perc;
  }

  private listenerUpdateFiles(inComingFiles) {

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

  private listenerUpdateFileState(fileToUpdate) {
    let i = this.files.findIndex(f => f.name == fileToUpdate.name);
    if (i > -1 && this.files[i]['proc'] != undefined) {
      let perc = (fileToUpdate.index / this.files[i].procLimit) * 100;
      this.files[i].proc = Math.trunc(perc);
    }
  }
}
