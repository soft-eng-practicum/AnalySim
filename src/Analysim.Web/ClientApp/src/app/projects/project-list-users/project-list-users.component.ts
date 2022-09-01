import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { ProjectUser } from 'src/app/interfaces/project-user';

@Component({
  selector: 'app-project-list-users',
  templateUrl: './project-list-users.component.html',
  styleUrls: ['./project-list-users.component.css']
})
export class ProjectListUsersComponent implements OnInit {

  constructor() { }

  @Input() projectUsers : ProjectUser[]
  @Output() updateProjectUsers = new EventEmitter<ProjectUser[]>()
  @Output() removeProjectUsers = new EventEmitter<ProjectUser[]>()

  ngOnInit(): void {
  }

  updateUser(projectUsers : ProjectUser[]){
    this.projectUsers = projectUsers
  }

  updateProjectUser(projectUser : ProjectUser){
    let index = this.projectUsers.findIndex(x => x.userID == projectUser.userID)
    if (index > -1) {
      this.projectUsers[index] = projectUser
    }
    this.updateProjectUsers.emit(this.projectUsers)
  }

  removeProjectUser(projectUser : ProjectUser){
    let index = this.projectUsers.indexOf(projectUser,0)
    if (index > -1) {
      this.projectUsers.splice(index, 1);
    }

    this.removeProjectUsers.emit(this.projectUsers)
  }

  

}
