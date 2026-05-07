import { Component, EventEmitter, Input, OnInit, Output, TemplateRef, ViewChild } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { ProjectLog } from 'src/app/interfaces/project-log';
import { User } from 'src/app/interfaces/user';
import { ProjectService } from 'src/app/services/project.service';

@Component({
  selector: 'app-project-log-item',
  templateUrl: './project-log-item.component.html',
  styleUrls: ['./project-log-item.component.scss'],
})
export class ProjectLogItemComponent implements OnInit {
  @Input() log: ProjectLog | null;
  @Input() projectID: number;
  @Input() currentUser: User;

  @ViewChild('deleteModal') deleteModal: TemplateRef<any>
  deleteModalRef: BsModalRef;
  // Delete Handling
  isDeleting = false;
  isDeleted = false;

  isOwner = false;

  isCommentAreaOpen: boolean = false;

  isEditing = false;

  commentCount = 0;

  selectedImageFile: File | null = null;
  imagePreviewUrl: SafeUrl | string | null = null;
  imageInputId = 'logImageInput';
  shouldRemoveImage = false;

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

    // Image Handling
    this.imageInputId = this.log
      ? `logImageInput-${this.log.logID}`
      : 'logImageInput-new';

    if (this.log?.image) {
      this.imagePreviewUrl = this.log.image;
    }

    // FORM
    this.title = new FormControl(this.log?.title ?? '');
    this.image = new FormControl('');
    this.content = new FormControl(this.log?.content ?? '', [Validators.required]);

    // Initialize FormGroup using FormBuilder
    this.logForm = this.formBuilder.group({
      title: this.title,
      image: this.image,
      content: this.content,
    });
  }

  onImageSelected(event: Event): void {
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

    this.selectedImageFile = file;
    this.shouldRemoveImage = false;

    const objectUrl = URL.createObjectURL(file);
    this.imagePreviewUrl = this.sanitizer.bypassSecurityTrustUrl(objectUrl);
  }

  onRemoveImage(event: MouseEvent, input: HTMLInputElement): void {
    event.preventDefault();
    event.stopPropagation();

    this.selectedImageFile = null;
    this.imagePreviewUrl = null;

    // Only tell backend to remove an image when updating an existing log
    if (this.log) {
      this.shouldRemoveImage = true;
    }

    if (this.image) {
      this.image.setValue(null);
    }

    input.value = '';
  }

  onCreateLog() {
    this.errorStatusAlert = false;
    this.errorResult = null;
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

  onUpdateLog(){
    if (!this.log) {
      return;
    }

    this.errorStatusAlert = false;
    this.errorResult = null;
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

  buildForm(): FormData | null {
    const log = this.logForm.value;

    const formData = new FormData();

    // Content is required
    if (log.content && log.content.trim().length > 0) {
      formData.append('content', log.content.trim());
    } else {
      this.handleError('Error: No content provided');
      return null;
    }

    // Title is optional
    if (log.title && log.title.trim().length > 0) {
      formData.append('title', log.title.trim());
    }

    // Image is optional
    if (this.selectedImageFile) {
      formData.append('image', this.selectedImageFile, this.selectedImageFile.name);
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

  handleError(text: string) {
    this.errorStatusAlert = true;
    this.errorResult = text;
    this.isLoading = false;
  }

  increaseCommentCount(){
    this.commentCount++;
  }

  // Delete

  onDeleteLog(): void {
    if(this.log.isDeleted) return;
    this.toggleModalDelete();
    this.isDeleting = true;
  }

  onHandleSuccessfulDelete(): void {
    this.isDeleted = true;
    this.isDeleting = false;
  }

  toggleModalDelete() {
    this.deleteModalRef = this.modalService.show(this.deleteModal)
  }
  
}
