import { Component, EventEmitter, Input, OnInit, Output, TemplateRef, ViewChild } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { Notebook } from 'src/app/interfaces/notebook';
import { ProjectLog } from 'src/app/interfaces/project-log';
import { User } from 'src/app/interfaces/user';
import { ProjectService } from 'src/app/services/project.service';

@Component({
  selector: 'app-project-log-item',
  templateUrl: './project-log-item.component.html',
  styleUrls: ['./project-log-item.component.scss'],
})
export class ProjectLogItemComponent implements OnInit {
  // Inputs
  @Input() log: ProjectLog | null;
  @Input() projectID: number;
  @Input() projectName?: string;
  @Input() currentUser: User;

  // Delete modal
  @ViewChild('deleteModal') deleteModal: TemplateRef<any>
  deleteModalRef: BsModalRef;
  isDeleting = false;
  isDeleted = false;

  // Repost modal
  @ViewChild('repostModal') repostModal: TemplateRef<any>
  repostModalRef: BsModalRef;
  isReposting = false;

  isOwner = false;
  isCommentAreaOpen: boolean = false;
  isEditing = false;
  commentCount = 0;

  // Image handling
  selectedImageFile: File | null = null;
  imagePreviewUrl: SafeUrl | string | null = null;
  imageInputId = 'logImageInput';
  shouldRemoveImage = false;

  // Outputs
  @Output() onSuccessfulCreate = new EventEmitter<void>();
  @Output() onSuccessfulEdit = new EventEmitter<void>();
  @Output() onCancelCreate = new EventEmitter<void>();

  errorResult: string;
  errorStatusAlert = false;

  // Form
  logForm: FormGroup;
  title: FormControl;
  image: FormControl;
  content: FormControl;
  isLoading: boolean = false;

  constructor(
    private projectService: ProjectService,
    private formBuilder: FormBuilder,
    private sanitizer: DomSanitizer,
    private modalService: BsModalService,
  ) {}

  ngOnInit(): void {
    if(this.log) {
      this.commentCount = this.log.commentCount;
      this.isDeleted = this.log.isDeleted;
    } 
    
    if(this.log != null && this.currentUser?.id == this.log.userID) this.isOwner = true;
    this.isEditing = this.log == null;

    this.imageInputId = this.log
      ? `logImageInput-${this.log.logID}`
      : 'logImageInput-new';

    if (this.log?.image) {
      this.imagePreviewUrl = this.log.image;
    }

    this.title = new FormControl(this.log?.title ?? '');
    this.image = new FormControl('');
    this.content = new FormControl(this.log?.content ?? '', [Validators.required]);

    this.logForm = this.formBuilder.group({
      title: this.title,
      image: this.image,
      content: this.content,
    });

    this.loadNotebookReferences();
  }

  // Select or preview uploaded image
  onImageSelected(event: Event): void {
    this.resetError();
    this.isLoading = true;

    const input = event.target as HTMLInputElement;

    if (!input.files || input.files.length === 0) {
      this.selectedImageFile = null;
      return;
    }

    const file = input.files[0];

    if (!file.type.startsWith('image/')) {
      this.selectedImageFile = null;
      input.value = '';
      return;
    }

    // Validate file size
    const maxFileSizeMb = 5;
    const maxFileSizeBytes = maxFileSizeMb * 1024 * 1024;

    if (file.size > maxFileSizeBytes) {
      this.selectedImageFile = null;
      this.imagePreviewUrl = null;
      input.value = '';

      this.handleError(
        `Error: Image must be smaller than ${maxFileSizeMb} MB`,
      );

      this.isLoading = false;
      return;
    }

    this.selectedImageFile = file;
    this.shouldRemoveImage = false;

    const objectUrl = URL.createObjectURL(file);
    this.imagePreviewUrl = this.sanitizer.bypassSecurityTrustUrl(objectUrl);

    this.isLoading = false;
  }

  // Remove current image from preview/update form
  onRemoveImage(event: MouseEvent, input: HTMLInputElement): void {
    event.preventDefault();
    event.stopPropagation();

    this.selectedImageFile = null;
    this.imagePreviewUrl = null;

    if (this.log) {
      this.shouldRemoveImage = true;
    }

    if (this.image) {
      this.image.setValue(null);
    }

    input.value = '';
  }

  // Create log
  onCreateLog() {
    this.resetError();
    this.isLoading = true;

    const formData = this.buildForm();
    if(formData == null) {
      this.isLoading = false;
      return;
    }
    formData.append('projectID', String(this.projectID));

    this.projectService.addProjectLog(formData).subscribe({
      next: () => {
        this.onSuccessfulCreate.emit();
      },
      error: (error) => {
        console.log(error);
        this.handleError(
          'Error: unable to create project log, please contact developers for assistance',
        );
      },
    });
  }

  // Update log
  onUpdateLog(){
    if (!this.log) {
      return;
    }

    this.resetError();
    this.isLoading = true;

    const formData = this.buildForm();
    if(formData == null) {
      this.isLoading = false;
      return;
    }

    if (this.shouldRemoveImage) {
      formData.append('removeImage', 'true');
    }

    this.projectService.updateProjectLog(formData, this.log.logID).subscribe({
      next: () => {
        this.onSuccessfulEdit.emit();
        this.isEditing = false;
      },
      error: (error) => {
        console.log(error);
        this.handleError(
          'Error: unable to update project log, please contact developers for assistance',
        );
      },
    });
  }

  // Build form data for create/update
  buildForm(): FormData | null {
    const log = this.logForm.value;

    const formData = new FormData();

    if (log.content && log.content.trim().length > 0) {
      formData.append('content', log.content.trim());
    } else {
      this.handleError('Error: No content provided');
      return null;
    }

    if (log.title && log.title.trim().length > 0) {
      formData.append('title', log.title.trim());
    }

    if (this.selectedImageFile) {
      formData.append('image', this.selectedImageFile, this.selectedImageFile.name);
    }

    if (this.selectedNotebookID) {
      formData.append('referencedNotebookID', String(this.selectedNotebookID));

      if (this.selectedNotebookVersion) {
        formData.append('referencedNotebookVersion', String(this.selectedNotebookVersion));
      }
    } else {
      formData.append('referencedNotebookID', '');
      formData.append('referencedNotebookVersion', '');
    }

    return formData;
  }

  cancelCreate() {
    this.onCancelCreate.emit();
  }

  onEdit(){
    this.isEditing = true;
  }

  cancelEdit(){
    this.errorStatusAlert = false;
    this.errorResult = null;

    this.isEditing = false;
    this.selectedImageFile = null;
    this.shouldRemoveImage = false;
    this.imagePreviewUrl = this.log?.image ?? null;

    if (this.logForm && this.log) {
      this.logForm.patchValue({
        title: this.log.title ?? '',
        image: '',
        content: this.log.content ?? '',
      });
    }
  }

  resetError(){
    this.errorStatusAlert = false;
    this.errorResult = null;
  }

  handleError(text: string) {
    this.errorStatusAlert = true;
    this.errorResult = text;
    this.isLoading = false;
  }

  increaseCommentCount(){
    this.commentCount++;
  }

  // Delete log
  onDeleteLog(): void {
    if(this.log.isDeleted) return;
    this.toggleModalDelete();
    this.isDeleting = true;
  }

  onHandleSuccessfulDelete(): void {
    this.isDeleted = true;
    this.isDeleting = false;
    this.onSuccessfulEdit.emit();
  }

  toggleModalDelete() {
    this.deleteModalRef = this.modalService.show(this.deleteModal)
  }

  // Repost log
  onRepostLog(): void {
    if(!this.log.isDeleted) return;
    this.toggleModalRepost();
    this.isReposting = true;
  }

  onHandleSuccessfulRepost(): void {
    this.isDeleted = false;
    this.isReposting = false;
    this.onSuccessfulEdit.emit();
  }

  toggleModalRepost() {
    this.repostModalRef = this.modalService.show(this.repostModal)
  }

  // Notebook Handling
  availableNotebooks: Notebook[] = [];

  selectedNotebookID: number | null = null;
  selectedNotebookVersion: number | null = null;

  selectedNotebook: Notebook | null = null;
  selectedNotebookVersions: number[] = [];

  loadNotebookReferences(): void {
    this.projectService.getProjectNotebookReferences(this.projectID)
      .subscribe(response => {
        this.availableNotebooks = response.result ?? [];

        // Create mode: default to None
        if (!this.log?.referencedNotebookID) {
          this.selectedNotebookID = null;
          this.selectedNotebookVersion = null;
          this.selectedNotebook = null;
          this.selectedNotebookVersions = [];
          return;
        }

        // Edit mode: preselect existing notebook
        this.selectedNotebookID = this.log.referencedNotebookID;

        this.onNotebookSelected(
          this.log.referencedNotebookID,
          this.log.referencedNotebookVersion ?? null
        );
      });
  }

  onNotebookSelected(
    notebookID: number | null,
    preferredVersion: number | null = null
  ): void {
    this.selectedNotebookID = notebookID;
    this.selectedNotebookVersion = null;
    this.selectedNotebookVersions = [];

    if (!notebookID) {
      this.selectedNotebook = null;
      return;
    }

    this.selectedNotebook = this.availableNotebooks.find(
      n => n.notebookID === Number(notebookID)
    ) ?? null;

    if (!this.selectedNotebook) {
      return;
    }

    if (this.selectedNotebook.type === 'observable') {
      this.selectedNotebookVersion = null;
      return;
    }

    this.loadNotebookVersions(this.selectedNotebook, preferredVersion);
  }

  loadNotebookVersions(notebook: Notebook, preferredVersion: number | null = null): void {
    this.projectService.getNotebookVersions(notebook)
      .subscribe({
        next: (versions) => {
          this.selectedNotebookVersions = versions;

          if (preferredVersion && versions.includes(preferredVersion)) {
            this.selectedNotebookVersion = preferredVersion;
          } else if (versions.length > 0) {
            this.selectedNotebookVersion = versions[0];
          } else {
            this.selectedNotebookVersion = null;
          }
        },
        error: (error) => {
          console.log(error);
          this.handleError('Error: unable to load notebook versions.');
        }
      });
  }

  @ViewChild('displayNotebookModal') displayNotebookModal: TemplateRef<any>;

  displayNotebookModalRef: BsModalRef;

  currentNotebook: Notebook | null = null;
  currentNotebookVersion: number = 0;

  onOpenNotebook(): void {
    if (!this.log.referencedNotebookID) {
      return;
    }

    this.projectService.getNotebook(this.log.referencedNotebookID).subscribe({
      next: (notebook) => {
        this.currentNotebook = notebook;
        this.currentNotebookVersion = this.log.referencedNotebookVersion ?? 0;

        this.displayNotebookModalRef = this.modalService.show(
          this.displayNotebookModal,
          {
            backdrop: 'static',
            class: 'modal-xl'
          }
        );
      },
      error: () => {
        alert('Unable to open the referenced notebook.');
      }
    });
  }

  closeDisplayNotebookModal(): void {
    if (this.displayNotebookModalRef) {
      this.displayNotebookModalRef.hide();
    }

    this.currentNotebook = null;
    this.currentNotebookVersion = 0;
  }
}
