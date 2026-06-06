import { Component, EventEmitter, Input, OnInit, Output, TemplateRef, ViewChild } from '@angular/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { ExpiredProjectLog } from 'src/app/interfaces/expired-project-log';

@Component({
  selector: 'app-expired-log-item',
  templateUrl: './expired-log-item.component.html',
  styleUrls: ['./expired-log-item.component.scss']
})
export class ExpiredLogItemComponent implements OnInit {
  @Input() log!: ExpiredProjectLog;
  @Output() onReload = new EventEmitter<void>();

  // Modals
    @ViewChild('restoreModal') restoreModal: TemplateRef<any>;
    @ViewChild('deleteModal') deleteModal: TemplateRef<any>;
  
    // Modal Refs
    restoreModalRef: BsModalRef;
    deleteModalRef: BsModalRef;
    
    isDeleted: boolean;
    isDeleting: boolean;
    isRestoring: boolean;
  
    constructor(private modalService: BsModalService) {}

  ngOnInit(): void {
  }

  // Delete

  onDelete(): void {
    this.toggleModalDelete();
    this.isDeleting = true;
  }

  onHandleSuccessfulDelete(): void {
    this.isDeleted = true;
    this.isDeleting = false;
    this.onReload.emit();
  }

  toggleModalDelete() {
    this.deleteModalRef = this.modalService.show(this.deleteModal)
  }

  // Restore

  onRestore(): void {
    this.toggleModalRestore();
    this.isRestoring = true;
  }

  onHandleSuccessfulRestore(): void {
    this.isRestoring = false;
    this.onReload.emit();
  }

  toggleModalRestore() {
    this.restoreModalRef = this.modalService.show(this.restoreModal)
  }

}
