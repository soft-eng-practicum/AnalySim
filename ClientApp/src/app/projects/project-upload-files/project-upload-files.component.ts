import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { FormControl } from '@angular/forms';
import { AccountService } from 'src/app/services/account.service';
import { FileService } from 'src/app/services/file.service';

enum FileStatus {
  Loading = 1, 
  Success = 2, 
  Error = 3}

@Component({
  selector: 'app-project-upload-files',
  templateUrl: './project-upload-files.component.html',
  styleUrls: ['./project-upload-files.component.css']
})
export class ProjectUploadFilesComponent implements OnInit {

  constructor(private fileService : FileService, private acctService : AccountService) { }

  @Input() file : FormControl;
  fileStatus : FileStatus;
  directory : string;
  @Input() key : string;
  @Output() deleteFormControl = new EventEmitter<FormControl>();


  ngOnInit(): void {

    this.fileStatus = FileStatus.Loading;
    this.directory = "" + "/" + this.key + "/";
    
    this.uploadFile();
  }

  uploadFile(){
    this.fileService.upload(this.file.value, 'temp', this.directory).subscribe(
      result => {
        this.fileStatus = FileStatus.Success;
      },
      error => {  
        this.fileStatus = FileStatus.Error;      
        console.log(error);
      }
    );
    
  }

  deleteFile(){
    
    /*
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
    */
    

    this.deleteFormControl.emit(this.file);

  }

}
