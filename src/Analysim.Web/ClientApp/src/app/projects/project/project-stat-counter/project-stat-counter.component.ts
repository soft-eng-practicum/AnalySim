import { Component, Input, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { Project } from 'src/app/interfaces/project';
import { ProjectRecommendation } from 'src/app/interfaces/project-recommendation';
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
  @ViewChild('recommendationListModal') recommendationListModal: TemplateRef<any>

  memberListModalRef: BsModalRef;
  recommendationListModalRef: BsModalRef;

  constructor(private modalService: BsModalService) { }

  ngOnInit(): void {
  }

  toggleModalMemberList() {
    this.memberListModalRef = this.modalService.show(this.memberListModal)
  }

  toggleModalRecommendationList() {
    this.recommendationListModalRef = this.modalService.show(this.recommendationListModal)
  }

  get currentRecommendation(): ProjectRecommendation {
    if (this.currentUser == null) return null
    if (this.project == null || this.project.projectRecommendations == null) return null
    return this.project.projectRecommendations.find(x => x.userID == this.currentUser.id) || null
  }

  get isOwner(): boolean {
    if (this.currentUser == null || this.project == null || this.project.projectUsers == null) return false

    const projectUser = this.project.projectUsers.find(x => x.userID == this.currentUser.id)
    return projectUser?.userRole == 'owner'
  }
}
