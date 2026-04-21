import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { User } from 'src/app/interfaces/user';
import { ProjectService } from 'src/app/services/project.service';

@Component({
  selector: 'app-modal-edit-publication',
  templateUrl: './modal-edit-publication.component.html',
  styleUrls: ['./modal-edit-publication.component.scss'],
})
export class ModalEditPublicationComponent implements OnInit {
  @Input() editModalRef: BsModalRef;
  @Input() currentUser: User;
  @Input() projectID: number;

  @Output() onSuccessfulEdit = new EventEmitter<void>();
  @Output() onCancelEdit = new EventEmitter<void>();

  errorResult: String;
  errorStatusAlert = false;

  // Form
  publicationForm: FormGroup;
  title: FormControl;
  url: FormControl;
  doi: FormControl;
  sourceAuthor: FormControl;
  year: FormControl;
  isLoading: boolean = false;

  constructor(
    private projectService: ProjectService,
    private formBuilder: FormBuilder,
  ) {}

  ngOnInit(): void {
    // Setup Form
    this.title = new FormControl('', [Validators.required]);
    this.url = new FormControl('');
    this.doi = new FormControl('');
    this.sourceAuthor = new FormControl('');
    this.year = new FormControl('');

    // Initialize FormGroup using FormBuilder
    this.publicationForm = this.formBuilder.group({
      title: this.title,
      url: this.url,
      doi: this.doi,
      sourceAuthor: this.sourceAuthor,
      year: this.year,
    });
  }

  onAddPublication(): void {
    let pub = this.publicationForm.value;
    this.isLoading = true;

    const formData = new FormData();
    formData.append('projectID', String(this.projectID));
    formData.append('title', pub.title);

    if (pub.url) formData.append('url', pub.url);
    if (pub.doi) formData.append('doi', pub.doi);
    if (pub.sourceAuthor) formData.append('sourceAuthor', pub.sourceAuthor);
    if (pub.year !== null && pub.year !== undefined && pub.year !== '') {
      formData.append('year', String(pub.year));
    }

    this.projectService.addPublication(formData).subscribe({
      next: () => {
        this.onSuccessfulEdit.emit();
        this.editModalRef.hide();
      },
      error: (error) => {
        this.errorStatusAlert = true;
        this.errorResult =
          'Error: unable to add publication, please contact developers for assistance';
        console.log(error);
        this.isLoading = false;
      },
    });
  }

  closeModal() {
    this.onCancelEdit.emit();
    this.editModalRef.hide();
  }
}
