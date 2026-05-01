import {
  Component,
  Input,
  OnInit,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { Project } from 'src/app/interfaces/project';
import { Publication } from 'src/app/interfaces/publication';
import { User } from 'src/app/interfaces/user';
import { ProjectService } from 'src/app/services/project.service';

@Component({
  selector: 'app-project-publication',
  templateUrl: './project-publication.component.html',
  styleUrls: ['./project-publication.component.scss'],
})
export class ProjectPublicationComponent implements OnInit {
  @Input() project: Project;
  @Input() currentUser: User;
  @Input() isMember: boolean;

  publications: Publication[] = [];

  isLoading = false;

  // Modals
  @ViewChild('editModal') editModal: TemplateRef<any>;
  editModalRef: BsModalRef;

  constructor(
    private modalService: BsModalService,
    private projectService: ProjectService,
  ) {}

  ngOnInit(): void {
    this.loadPublications();
  }

  loadPublications(): void {
    if (!this.project || this.project.projectID <= 0) return;

    this.isLoading = true;

    this.projectService.getPublications(this.project.projectID).subscribe({
      next: (publications) => {
        this.publications = publications;
        this.isLoading = false;
      },
      error: (error) => {
        console.log('Failed to load comments', error);
        this.isLoading = false;
      },
    });
  }

  onAddPublication() {
    this.editModalRef = this.modalService.show(this.editModal);
  }

  // Sorting
  sortOrder: 'newest' | 'oldest' = 'newest';
  isSortOpen = false;

  setSortOrder(order: 'newest' | 'oldest') {
    if (this.sortOrder === order) return;
    this.sortOrder = order;
  }

  toggleSortDropdown() {
    this.isSortOpen = !this.isSortOpen;
  }

  selectSortOrder(order: 'newest' | 'oldest') {
    this.isSortOpen = false;
    this.setSortOrder(order);
  }

  get sortedPublications(): Publication[] {
    const pubs = this.publications ? [...this.publications] : [];

    return pubs.sort((a, b) => {
      const aTime = new Date(a.year).getTime();
      const bTime = new Date(b.year).getTime();

      return this.sortOrder === 'newest' ? bTime - aTime : aTime - bTime;
    });
  }
}
