import { Component, OnInit } from '@angular/core';
import { EventEmitter, Input, Output } from '@angular/core';
import { BlobFile } from 'src/app/interfaces/blob-file';
import { ProjectService } from 'src/app/services/project.service';

@Component({
  selector: 'app-dataset-actions',
  templateUrl: './dataset-actions.component.html',
  styleUrls: ['./dataset-actions.component.scss']
})
export class DatasetActionsComponent implements OnInit {

  @Input() dataset : BlobFile;
  @Output() datasetDeleted: EventEmitter<any> = new EventEmitter<any>();
  @Output() datasetPreview: EventEmitter<any> = new EventEmitter<any>();
  constructor(private projectService : ProjectService) { }

  ngOnInit(): void {
  }

  preview() {
      this.datasetPreview.emit(this.dataset);
  }

  deleteDataset() {
      this.projectService.deleteFile(this.dataset.blobFileID, true).subscribe(res => {
        this.datasetDeleted.emit();
      })
  }
}
