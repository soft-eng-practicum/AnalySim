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

  constructor(private projectSerivce : ProjectService, private accountService : AccountService) { }

  @Input() uploadFileItem : UploadFileItem
  @Output() uploadedFile = new EventEmitter<BlobFile>()
  @Output() updatedFile = new EventEmitter<UploadFileItem>()
  @Output() removedFile = new EventEmitter<UploadFileItem>()
  
  currentUserID : number


  ngOnInit(): void {
    this.accountService.currentUserID.subscribe(x => this.currentUserID = x)

    if(this.uploadFileItem.uploadStatus == "loading")
      this.uploadFile();
  }

  uploadFile(){
    this.projectSerivce.uploadFile(this.uploadFileItem.file, this.uploadFileItem.directory, this.currentUserID, this.uploadFileItem.projectID).subscribe(
      result => {
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
