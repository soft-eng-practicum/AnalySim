import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormControl} from '@angular/forms';
import { FileService } from '../services/file.service';
import { AccountService } from '../services/account.service';

enum FileStatus {
  Loading = 1, 
  Success = 2, 
  Error = 3}

@Component({
  selector: 'app-upload-files',
  templateUrl: './upload-files.component.html',
  styleUrls: ['./upload-files.component.css']
})

export class UploadFilesComponent implements OnInit {

  constructor(private fileService : FileService, private acctService : AccountService) { }

  @Input() file : FormControl;
  fileStatus : FileStatus;
  directory : string;
  @Input() key : string;
  @Output() deleteFormControl = new EventEmitter<FormControl>();


  ngOnInit(): void {

    this.fileStatus = FileStatus.Loading;
    this.directory = this.acctService.currentUsername + "/" + this.key + "/";
    
    this.uploadFile();
  }

  uploadFile(){

    this.fileService.upload(this.file.value, 'temp', this.directory).subscribe(
      result => {
        this.fileStatus = FileStatus.Success;
        console.log(result);
      },
      error => {  
        this.fileStatus = FileStatus.Error;      
        console.log(error);
      }
    );
    
  }

  deleteFile(){
    
    
    this.fileService.delete('temp', this.directory).subscribe(
      result => {
        this.fileStatus = FileStatus.Success;
        console.log(result);
      },
      error => {  
        this.fileStatus = FileStatus.Error;      
        console.log(error);
      }
    );
    

    this.deleteFormControl.emit(this.file);

  }

}
