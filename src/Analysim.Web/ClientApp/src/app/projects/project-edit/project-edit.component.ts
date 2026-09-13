import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Project } from 'src/app/interfaces/project';
import { ProjectTag } from 'src/app/interfaces/project-tag';
import { ProjectUser } from 'src/app/interfaces/project-user';
import { ProjectMembershipRequest } from 'src/app/interfaces/project-membership-request';
import { ProjectService } from 'src/app/services/project.service';

@Component({
  selector: 'app-project-edit',
  templateUrl: './project-edit.component.html',
  styleUrls: ['./project-edit.component.scss'] 
})
export class ProjectEditComponent implements OnInit {

  project : Project = null;
  owner: string = null;
  projectname: string = null;
  membershipRequests: ProjectMembershipRequest[] = [];
  requestActionID: number = null;

  constructor(
    private route: ActivatedRoute,
    private projectService: ProjectService
  ) { }


  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.owner = params['owner'];
      this.projectname = params['projectname'];
    });
  }

  setProject(project : Project){
    this.project = project
    this.loadMembershipRequests()
  }

  updateProjectTags(projectTags : ProjectTag[]){
    this.project.projectTags = projectTags
  }

  updateProjectUsers(projectUsers : ProjectUser[]){
    this.project.projectUsers = projectUsers
  }

  get pendingJoinRequests(): ProjectMembershipRequest[] {
    return this.membershipRequests.filter(request =>
      request.type == "join_request" &&
      request.status == "pending")
  }

  get pendingInvitations(): ProjectMembershipRequest[] {
    return this.membershipRequests.filter(request =>
      request.type == "invitation" &&
      request.status == "pending")
  }

  loadMembershipRequests(){
    if(this.project == null) return

    this.projectService.getProjectMembershipRequests(this.project.projectID).subscribe(
      result => {
        this.membershipRequests = result
      }, error => {
        console.log(error)
      }
    )
  }

  acceptRequest(request: ProjectMembershipRequest){
    if(this.requestActionID != null) return
    this.requestActionID = request.projectMembershipRequestID

    this.projectService.acceptProjectMembershipRequest(request.projectMembershipRequestID).subscribe(
      result => {
        let index = this.project.projectUsers.findIndex(projectUser => projectUser.userID == result.userID)
        if(index > -1) this.project.projectUsers[index] = result
        else this.project.projectUsers.push(result)

        this.membershipRequests = this.membershipRequests.filter(item => item.projectMembershipRequestID != request.projectMembershipRequestID)
        this.requestActionID = null
      }, error => {
        console.log(error)
        this.requestActionID = null
      }
    )
  }

  rejectRequest(request: ProjectMembershipRequest){
    if(this.requestActionID != null) return
    this.requestActionID = request.projectMembershipRequestID

    this.projectService.rejectProjectMembershipRequest(request.projectMembershipRequestID).subscribe(
      result => {
        this.membershipRequests = this.membershipRequests.filter(item => item.projectMembershipRequestID != result.projectMembershipRequestID)
        this.requestActionID = null
      }, error => {
        console.log(error)
        this.requestActionID = null
      }
    )
  }

  cancelInvitation(request: ProjectMembershipRequest){
    if(this.requestActionID != null) return
    this.requestActionID = request.projectMembershipRequestID

    this.projectService.cancelProjectMembershipRequest(request.projectMembershipRequestID).subscribe(
      result => {
        this.membershipRequests = this.membershipRequests.filter(item => item.projectMembershipRequestID != result.projectMembershipRequestID)
        this.requestActionID = null
      }, error => {
        console.log(error)
        this.requestActionID = null
      }
    )
  }

}
