// src/app/admin/components/datasets/admin-datasets.component.ts
import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { BlobFile } from 'src/app/interfaces/blob-file';
import { ProjectService } from 'src/app/services/project.service';

@Component({
  selector: 'app-datasets',
  templateUrl: './datasets.component.html',
  styleUrls: ['./datasets.component.scss']
})
export class DatasetsComponent implements OnInit {
  datasets: BlobFile[] = [];
  loading = false;
  error: string | null = null;

  selectedDataset: BlobFile | null = null;
  @ViewChild('previewModal') previewModal!: TemplateRef<any>;
  previewModalRef!: BsModalRef;

  constructor(
    private projectService: ProjectService,
    private modalService: BsModalService
  ) {}

  ngOnInit() {
    this.loadDatasets();
  }

  loadDatasets() {
    this.loading = true;
    this.error = null;
    this.projectService.getAllDatasets().subscribe({
      next: list => {
        this.datasets = list;
        this.loading = false;
      },
      error: e => {
        this.error = e.message || 'Failed to load datasets';
        this.loading = false;
      }
    });
  }

  preview(ds: BlobFile) {
    this.selectedDataset = ds;
    this.previewModalRef = this.modalService.show(this.previewModal, { class: 'modal-lg' });
  }

  closePreview() {
    this.previewModalRef.hide();
  }
}
