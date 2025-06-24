import { Component, OnInit } from '@angular/core';
import { Notebook } from 'src/app/interfaces/notebook';
import { ProjectService } from 'src/app/services/project.service';

@Component({
  selector: 'app-notebooks',
  templateUrl: './notebooks.component.html',
  styleUrls: ['./notebooks.component.scss']
})
export class NotebooksComponent implements OnInit {
  notebooks: Notebook[] = [];
  loading = false;
  error: string | null = null;

  constructor(private projectService: ProjectService) { }

  ngOnInit(): void {
    this.loadNotebooks();
  }

  loadNotebooks() {
    this.loading = true;
    this.error = null;
    this.projectService.getAllNotebooks().subscribe({
      next: nbs => {
        this.notebooks = nbs.filter(nb => nb.type !== 'folder');
        this.loading = false;
      },
      error: err => {
        this.error = err.message || 'Failed to load notebooks';
        this.loading = false;
      }
    });
  }
}
