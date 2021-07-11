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
  newProject: Project = null

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
          .filter(x => x.userRole != "member")
          .map(x => x.project)

        //check if project already exists 
        for (var i = 0; i < this.projects.length; i++) {
          if (this.projects[i].route == this.project.route) {
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
    console.log(this.project)

    // get project's blobfiles ID
    var blobFilesID : number [] = []
    for(let i=0; i< this.project.blobFiles.length; i++ ){
      blobFilesID.push(this.project.blobFiles[i].blobFileID)
    }

    console.log(this.project.projectID)
    
    this.projectService.forkProject(this.currentUser.id, this.project.projectID, blobFilesID).subscribe(
      result => {
        this.isExisted = true
        this.newProject = result
      }, error => {
        console.log(error)
      }
    )
  }
  onNavigateToNewProject(){
    this.closeModal()
    this.router.navigate(['/project/' + this.currentUser.userName +'/'+ this.newProject.name])
  }
}
