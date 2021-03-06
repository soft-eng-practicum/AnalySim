import { Component, Input, OnInit } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { Project } from 'src/app/interfaces/project';
import { User } from 'src/app/interfaces/user';
import { ProjectService } from 'src/app/services/project.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-modal-fork',
  templateUrl: './modal-fork.component.html',
  styleUrls: ['./modal-fork.component.css']
})
export class ModalForkComponent implements OnInit {

  constructor(
    private router: Router,
    private projectService: ProjectService,) { }

  @Input() forkModalRef: BsModalRef
  @Input() project: Project
  @Input() currentUser: User

  isExisted: boolean
  projects: Project[] = []

  ngOnInit() : void {
    // find all project associate with user 
    let projectIDs: number[] = this.currentUser.projectUsers.map(pu => pu.projectID)

    this.projectService.getProjectRange(projectIDs).subscribe(
      result => {
        // Map Project in Project User
        this.currentUser.projectUsers.map(pu => pu.project = result.find(p => p.projectID == pu.projectID))
        // Map Project
        this.projects = this.currentUser.projectUsers
          .filter(x => x.userRole != "follower")
          .map(x => x.project)

        //check if project already exists 
        for (var i = 0; i < this.projects.length; i++) {
          if (this.projects[i].name == this.project.name) {
            this.isExisted = true
          }
        }
      }, error => {
        console.log(error)
      }
    )
  }

  closeModal() {
    this.forkModalRef.hide()
  }

  // create a new project in user's dashboad 
  forkProject() {
    this.projectService.forkProject(this.currentUser.id, this.project.projectID).subscribe(
      result => {
        this.router.navigate([result.route])
      }, error => {
        console.log(error)
      }
    )
    this.closeModal()
  }

}
