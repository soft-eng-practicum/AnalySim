import { Component, OnInit } from '@angular/core';
import { ProjectService } from 'src/app/services/project.service';
import { BlobFile } from '../../../interfaces/blob-file';

@Component({
  selector: 'app-datasets',
  templateUrl: './datasets.component.html',
  styleUrls: ['./datasets.component.scss']
})
export class DatasetsComponent implements OnInit {
  datasets: BlobFile[] = [];
  loading = true;
  error: string = null;

  constructor(private project: ProjectService) { }

  ngOnInit() {
    this.project.getAllDatasets().subscribe({
      next: result  => {
        this.datasets = result;
        this.loading = false;
      },
      error: () => {
        this.error = 'Failed to load datasets';
        this.loading = false;
      }
    });
  }
}
