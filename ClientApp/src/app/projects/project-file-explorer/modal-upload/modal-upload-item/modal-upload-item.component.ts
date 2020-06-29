import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { AccountService } from 'src/app/services/account.service';
import { BlobFile } from 'src/app/interfaces/blob-file';
import { ProjectService } from 'src/app/services/project.service';
import { UploadFileItem } from 'src/app/interfaces/upload-file-item';

@Component({
  selector: 'app-modal-upload-item',
  templateUrl: './modal-upload-item.component.html',
  styleUrls: ['./modal-upload-item.component.css']
})
export class ModalUploadItemComponent implements OnInit {

  constructor(private projectSerivce : ProjectService, private acctService : AccountService) { }

  @Input() uploadFileItem : UploadFileItem
  @Output() uploadedFile = new EventEmitter<BlobFile>()
  @Output() updatedFile = new EventEmitter<UploadFileItem>()
  @Output() removedFile = new EventEmitter<UploadFileItem>()
  


  ngOnInit(): void {
    if(this.uploadFileItem.uploadStatus == "loading")
      this.uploadFile();
  }

  uploadFile(){
    this.projectSerivce.uploadFile(this.uploadFileItem.file, this.uploadFileItem.directory, 1, this.uploadFileItem.projectID).subscribe(
      result => {
        console.log(result)
        this.uploadFileItem.uploadStatus = "success";
        this.uploadedFile.emit(result)
        this.updatedFile.emit(this.uploadFileItem)
      },
      error => {
        console.log(error);
        this.uploadFileItem.uploadStatus = "error";
        this.updatedFile.emit(this.uploadFileItem)      
        
      }
    )
  }

  removeFile(){
    this.removedFile.emit(this.uploadFileItem)
  }

}
