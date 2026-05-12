import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { Publication } from 'src/app/interfaces/publication';
import { User } from 'src/app/interfaces/user';

@Component({
  selector: 'app-publication-item',
  templateUrl: './publication-item.component.html',
  styleUrls: ['./publication-item.component.scss'],
})
export class PublicationItemComponent implements OnInit {
  @Input() publication!: Publication;
  @Input() isMember: boolean;
  @Input() currentUser: User;
  @Input() projectId: number;

  @Output() onReload = new EventEmitter<void>();

  // Modals
  @ViewChild('deleteModal') deleteModal: TemplateRef<any>;
  deleteModalRef: BsModalRef;
  @ViewChild('editModal') editModal: TemplateRef<any>;
  editModalRef: BsModalRef;

  isHandlingAction = false;

  constructor(
    private modalService: BsModalService
  ) {}

  async ngOnInit(): Promise<void> {}

  onDeletePublication(): void {
    this.toggleModalDelete();
    this.isHandlingAction = true;
  }

  onHandleSuccessfulAction(): void {
    this.isHandlingAction = false;
    this.onReload.emit();
  }

  toggleModalDelete() {
    this.deleteModalRef = this.modalService.show(this.deleteModal);
  }

  onEditPublication(): void{
    this.toggleModalEdit();
    this.isHandlingAction = true;
  }

  toggleModalEdit(): void{
    this.editModalRef = this.modalService.show(this.editModal);
  }
}
