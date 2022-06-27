import { Component, OnInit, Input, ViewChild, TemplateRef } from '@angular/core';
import { BlobFile } from 'src/app/interfaces/blob-file';

@Component({
  selector: 'app-project-file-preview',
  templateUrl: './project-file-preview.component.html',
  styleUrls: ['./project-file-preview.component.css']
})
export class ProjectFilePreviewComponent implements OnInit {

  constructor() { }

  @Input() blobFile : BlobFile
  @ViewChild('observablehqModal') observablehqModal : TemplateRef<any>;

  showNotebook : boolean
  notebookLink : string

  ngOnInit(): void {
    this.showNotebook = false;
  }

  toggleModalObservablehq(){
    // Show Folder Modal
  }

  loadNotebook(notebookLink : string){
    this.showNotebook = true
    this.notebookLink = notebookLink
  }

}
