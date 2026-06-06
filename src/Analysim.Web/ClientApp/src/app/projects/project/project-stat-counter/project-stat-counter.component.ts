import { Component, Input, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { Project } from 'src/app/interfaces/project';
import { User } from 'src/app/interfaces/user';

@Component({
  selector: 'app-project-stat-counter',
  templateUrl: './project-stat-counter.component.html',
  styleUrls: ['./project-stat-counter.component.scss']
})
export class ProjectStatCounterComponent implements OnInit {
  @Input() project: Project;
  @Input() currentUser: User;

  @ViewChild('memberListModal') memberListModal: TemplateRef<any>

  memberListModalRef: BsModalRef;

  constructor(private modalService: BsModalService) { }

  ngOnInit(): void {
  }

  toggleModalMemberList() {
    this.memberListModalRef = this.modalService.show(this.memberListModal)
  }

}
