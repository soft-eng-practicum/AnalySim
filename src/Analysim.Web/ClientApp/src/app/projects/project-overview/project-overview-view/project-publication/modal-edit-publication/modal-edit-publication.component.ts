import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { Publication } from 'src/app/interfaces/publication';
import { ProjectService } from 'src/app/services/project.service';

@Component({
  selector: 'app-modal-edit-publication',
  templateUrl: './modal-edit-publication.component.html',
  styleUrls: ['./modal-edit-publication.component.scss'],
})
export class ModalEditPublicationComponent implements OnInit {
  @Input() editingPublication: Publication | null;

  @Input() editModalRef: BsModalRef;
  @Input() projectID: number;

  @Output() onSuccessfulEdit = new EventEmitter<void>();
  @Output() onCancelEdit = new EventEmitter<void>();

  errorResult: string;
  errorStatusAlert = false;

  modalTitle = '';

  // Form
  publicationForm: FormGroup;
  title: FormControl;
  url: FormControl;
  doi: FormControl;
  sourceAuthor: FormControl;
  year: FormControl;
  journal: FormControl;
  notes: FormControl;
  isLoading: boolean = false;

  constructor(
    private projectService: ProjectService,
    private formBuilder: FormBuilder,
  ) {}

  ngOnInit(): void {
    if (this.editingPublication) this.modalTitle = 'Edit Publication';
    else this.modalTitle = 'Add Publication';

    // Setup Form
    const ep = this.editingPublication;
    this.title = new FormControl(ep ? (ep.title ? ep.title : '') : '', [
      Validators.required,
    ]);
    this.url = new FormControl(ep ? (ep.url ? ep.url : '') : '');
    this.doi = new FormControl(ep ? (ep.doi ? ep.doi : '') : '');
    this.sourceAuthor = new FormControl(ep ? (ep.sourceAuthor ? ep.sourceAuthor : '') : '');
    this.year = new FormControl(ep ? (ep.year ? ep.year : '') : '');
    this.journal = new FormControl(ep ? (ep.journal ? ep.journal : '') : '');
    this.notes = new FormControl(ep ? (ep.notes ? ep.notes : '') : '');

    // Initialize FormGroup using FormBuilder
    this.publicationForm = this.formBuilder.group({
      title: this.title,
      journal: this.journal,
      url: this.url,
      doi: this.doi,
      sourceAuthor: this.sourceAuthor,
      year: this.year,
      notes: this.notes,
    });
  }

  onAddPublication(): void {
    this.errorStatusAlert = false;
    this.errorResult = null;
    this.isLoading = true;

    const formData = this.buildForm();
    if(formData == null) {
      this.isLoading = false;
      return;
    }

    this.projectService.addPublication(formData).subscribe({
      next: () => {
        this.onSuccessfulEdit.emit();
        this.editModalRef.hide();
      },
      error: (error) => {
        console.log(error);
        this.handleError(
          'Error: unable to add publication, please contact developers for assistance',
        );
      },
    });
  }

  onEditPublication(){
    this.errorStatusAlert = false;
    this.errorResult = null;
    this.isLoading = true;

    const formData = this.buildForm();
    if(formData == null) {
      this.isLoading = false;
      return;
    }

    if (!this.editingPublication) {
      this.handleError('Error: No publication selected for editing.');
      return;
    }

    this.projectService.updatePublication(formData, this.editingPublication.publicationID).subscribe({
      next: () => {
        this.onSuccessfulEdit.emit();
        this.editModalRef.hide();
      },
      error: (error) => {
        console.log(error);
        this.handleError(
          'Error: unable to update publication, please contact developers for assistance',
        );
      },
    });
  }

  buildForm(): FormData | null {
    let pub = this.publicationForm.value;

    const formData = new FormData();
    formData.append('projectID', String(this.projectID));

    // validate required fields
    if (pub.sourceAuthor) {
      formData.append('sourceAuthor', pub.sourceAuthor);
    } else {
      this.handleError('Error: No source author provided');
      return null;
    }
    if (pub.year !== null && pub.year !== undefined && pub.year !== '') {
      formData.append('year', String(pub.year));
    } else {
      this.handleError('Error: No valid year provided');
      return null;
    }
    if (pub.journal) {
      formData.append('journal', pub.journal);
    } else {
      this.handleError('Error: No publication journal provided');
      return null;
    }

    if (pub.title) formData.append('title', pub.title);
    if (pub.url) formData.append('url', pub.url);
    if (pub.doi) formData.append('doi', pub.doi);
    if (pub.notes) formData.append('notes', pub.notes);

    return formData;
  }

  closeModal() {
    this.onCancelEdit.emit();
    this.editModalRef.hide();
  }

  handleError(text: string) {
    this.errorStatusAlert = true;
    this.errorResult = text;
    this.isLoading = false;
  }
}
