import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { UploadFileItem } from 'src/app/interfaces/upload-file-item';
import { BlobFile } from 'src/app/interfaces/blob-file';

@Component({
  selector: 'app-modal-upload',
  templateUrl: './modal-upload.component.html',
  styleUrls: ['./modal-upload.component.css']
})
export class ModalUploadComponent implements OnInit {

  constructor() { }

  @Input() uploadFileList : UploadFileItem[]
  @Input() uploadModalRef : BsModalRef

  @Output() updatedFileListEvent = new EventEmitter<UploadFileItem[]>()
  @Output() uploadedFileEvent = new EventEmitter<BlobFile>()

  ngOnInit(): void {
  }

  uploadedFile(blobFile : BlobFile){
    this.uploadedFileEvent.emit(blobFile)
  }

  updateFileUpload(uploadFileItem : UploadFileItem){
    this.uploadFileList.map(x => {
      if(x.file.name == uploadFileItem.file.name){
        x = uploadFileItem
      }
      return x
    })
    this.updatedFileListEvent.emit(this.uploadFileList)
  }

  removeFileUpload(uploadFileItem : UploadFileItem){
    this.uploadFileList = this.uploadFileList.filter(x => x.file.name != uploadFileItem.file.name)
    this.updatedFileListEvent.emit(this.uploadFileList)
  }

}
