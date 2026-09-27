import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Project } from 'src/app/interfaces/project';
import { ProjectTag } from 'src/app/interfaces/project-tag';
import { ProjectUser } from 'src/app/interfaces/project-user';
import { ProjectMembershipRequest } from 'src/app/interfaces/project-membership-request';
import { ProjectService } from 'src/app/services/project.service';
import { AccountService } from 'src/app/services/account.service';
import { User } from 'src/app/interfaces/user';

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
  currentUser: User = null;

  constructor(
    private route: ActivatedRoute,
    private projectService: ProjectService,
    private accountService: AccountService
  ) { }


  async ngOnInit() {
    const currentUser$ = await this.accountService.currentUser;
    currentUser$.subscribe(user => this.currentUser = user);

    this.route.params.subscribe(params => {
      this.owner = params['owner'];
      this.projectname = params['projectname'];
    });
  }

  setProject(project : Project){
    this.project = project
    if (this.canManageMembers) this.loadMembershipRequests()
  }

  get projectUser(): ProjectUser {
    if (this.project == null || this.currentUser == null) return null
    return this.project.projectUsers.find(projectUser => projectUser.userID == this.currentUser.id) || null
  }

  get isOwner(): boolean {
    return this.projectUser?.userRole == 'owner'
  }

  get canManageTags(): boolean {
    return this.isOwner || (this.projectUser?.userRole == 'member' &&
      this.project?.memberPermissions?.membersCanManageTags == true)
  }

  get canManageMembers(): boolean {
    return this.isOwner || (this.projectUser?.userRole == 'member' &&
      this.project?.memberPermissions?.membersCanManageMembers == true)
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
