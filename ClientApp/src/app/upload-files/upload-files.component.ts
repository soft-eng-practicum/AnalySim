import { Component, OnInit, ViewChild } from '@angular/core';
import { FileService } from '../services/file.service';

@Component({
  selector: 'app-upload-files',
  templateUrl: './upload-files.component.html',
  styleUrls: ['./upload-files.component.css']
})
export class UploadFilesComponent implements OnInit {

  @ViewChild('fileInput') fileInput:any;
  constructor(private fileService: FileService) { }

  ngOnInit(): void {
  }

  uploadPhoto(){
    
  }

}
