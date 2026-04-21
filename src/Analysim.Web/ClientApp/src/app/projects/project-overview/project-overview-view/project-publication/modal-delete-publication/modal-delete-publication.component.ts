import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { Publication } from 'src/app/interfaces/publication';
import { ProjectService } from 'src/app/services/project.service';

@Component({
  selector: 'app-modal-delete-publication',
  templateUrl: './modal-delete-publication.component.html',
  styleUrls: ['./modal-delete-publication.component.scss'],
})
export class ModalDeletePublicationComponent implements OnInit {
  @Input() deleteModalRef: BsModalRef;
  @Input() publication: Publication;

  @Output() onSuccessfulDelete = new EventEmitter<void>();
  @Output() onCancelDelete = new EventEmitter<void>();

  errorResult: String;
  errorStatusAlert = false;

  constructor(private projectService: ProjectService) {}

  ngOnInit(): void {}

  onDeleteComment(): void {
    this.projectService
      .deletePublication(this.publication.publicationID)
      .subscribe({
        next: () => {
          console.log('Deleted publication', this.publication.publicationID);
          this.onSuccessfulDelete.emit();
          this.deleteModalRef.hide();
        },
        error: (error) => {
          this.errorStatusAlert = true;
          this.errorResult =
            'Error: unable to delete publication, please contact developers for assistance';
          console.log(error);
        },
      });
  }

  closeModal() {
    this.onCancelDelete.emit();
    this.deleteModalRef.hide();
  }
}
