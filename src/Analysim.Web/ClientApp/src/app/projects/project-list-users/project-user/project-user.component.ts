import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { ProjectUser } from 'src/app/interfaces/project-user';
import { ProjectService } from 'src/app/services/project.service';

@Component({
  selector: 'app-project-user',
  templateUrl: './project-user.component.html',
  styleUrls: ['./project-user.component.scss']
})
export class ProjectUserComponent implements OnInit {

  constructor(private projectService : ProjectService) { }

  @Input() projectUser : ProjectUser
  @Output() removedUser = new EventEmitter<ProjectUser>()

  ngOnInit(): void {
  }

  deleteUser(){
    this.projectService.removeUser(this.projectUser.projectID, this.projectUser.userID).subscribe(
      result => {
        this.removedUser.emit(this.projectUser)
      }, error =>{
        console.log(error)
      }
    )
  }

}
