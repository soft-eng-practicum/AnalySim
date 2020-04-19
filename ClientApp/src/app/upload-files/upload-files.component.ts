import { Component, OnInit, Input } from '@angular/core';
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
  key : string;


  ngOnInit(): void {
    this.fileStatus = FileStatus.Loading;
    this.directory = this.key + "/";
    
    this.uploadFile();
  }

  uploadFile(){
    
    this.fileService.upload(this.file.value, 'temp', '1561651651/').subscribe(
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

}
