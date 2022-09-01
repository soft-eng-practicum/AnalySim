import { Component, OnInit, Input, ViewChild, TemplateRef } from '@angular/core';
import { BlobFile } from 'src/app/interfaces/blob-file';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';

@Component({
  selector: 'app-project-file-preview',
  templateUrl: './project-file-preview.component.html',
  styleUrls: ['./project-file-preview.component.scss']
})
export class ProjectFilePreviewComponent implements OnInit {

  constructor(
    private modalService : BsModalService
    ) { }

  @Input() blobFile : BlobFile
  @ViewChild('observablehqModal') observablehqModal : TemplateRef<any>;
  observablehqModalRef : BsModalRef;

  showNotebook : boolean
  notebookLink : string

  ngOnInit(): void {
    this.showNotebook = false;
  }

  toggleModalObservablehq(){
    // Show Folder Modal
    this.observablehqModalRef = this.modalService.show(this.observablehqModal)
  }

  loadNotebook(notebookLink : string){
    this.showNotebook = true
    this.notebookLink = notebookLink
  }

}
