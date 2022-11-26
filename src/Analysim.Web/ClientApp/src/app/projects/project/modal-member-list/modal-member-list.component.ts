import { Component, Input, OnInit } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { Project } from 'src/app/interfaces/project';
import { ProjectUser } from 'src/app/interfaces/project-user';
import { User } from 'src/app/interfaces/user';

@Component({
  selector: 'app-modal-member-list',
  templateUrl: './modal-member-list.component.html',
  styleUrls: ['./modal-member-list.component.scss']
})
export class ModalMemberListComponent implements OnInit {

  constructor() { }

  @Input() memberListModalRef: BsModalRef
  @Input() projectUsers: ProjectUser[];
  @Input() currentUser: User

  ngOnInit(): void {
  }

  closeModal() {
    this.memberListModalRef.hide()
  }

}
