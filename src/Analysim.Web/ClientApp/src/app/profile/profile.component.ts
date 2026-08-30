import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AccountService } from '../services/account.service';
import { User } from '../interfaces/user';
import { Project } from '../interfaces/project';
import { ProjectService } from '../services/project.service';
import { Observable } from 'rxjs';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { ProjectMembershipRequest } from '../interfaces/project-membership-request';
import { ProjectUser } from '../interfaces/project-user';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
  profileImageUrl: SafeUrl;

  constructor(private route: ActivatedRoute,
    private router: Router,
    private accountService: AccountService,
    private sanitizer: DomSanitizer,
    private projectService: ProjectService) { }

  currentUser$: Observable<User> = null

  profile: User
  projects: Project[]
  followings: User[]
  followers: User[]
  membershipRequests: ProjectMembershipRequest[] = []

  tabActive: boolean[] = [true, false, false, false]
  showError: boolean
  requestActionID: number = null

  currentUser: User = null


  async ngOnInit() {
    if (this.accountService.checkLoginStatus()) {
      await this.accountService.currentUser.then((x) => this.currentUser$ = x)
      this.currentUser$.subscribe(x => {
        this.currentUser = x
        this.loadMembershipRequests()
      })
    }

    this.route.params.subscribe(params => {
      this.profile = undefined
      this.projects = []
      this.followings = []
      this.followers = []
      this.membershipRequests = []
      this.showError = false
      this.requestActionID = null
      this.tabActive = [true, false, false, false]


      let username = params["username"]
      this.accountService.getUserByName(username)
        .subscribe(
          result => {
            this.profile = result
            this.loadProject(result)
            this.loadFollowing(result)
            this.loadFollower(result)
            this.loadMembershipRequests()
            this.profileImage()
          }, error => {
            this.showError = true
          })
    })
  }

  profileImage() {
    if (this.profile.blobFiles.length != 0) {
      var blobFile = this.profile.blobFiles.find(x => x.container == 'profile')
      if (blobFile != null) {
        this.projectService.downloadFile(blobFile.blobFileID).subscribe(
          imageBlob => {
            if (imageBlob == null) this.profileImageUrl = "../../assets/img/default-profile.png";
            const objectURL = URL.createObjectURL(imageBlob);
            this.profileImageUrl = this.sanitizer.bypassSecurityTrustUrl(objectURL);
          }, error => {
            console.log(error)
            this.profileImageUrl = "../../assets/img/default-profile.png";
          }
        )
      }
      else this.profileImageUrl = "../../assets/img/default-profile.png";
    }
    else this.profileImageUrl = "../../assets/img/default-profile.png";
  }

  changeTab(num: number) {
    if (num == 3 && !this.isOwnProfile) return

    this.tabActive.forEach((t, i) => {
      if (num != i)
        this.tabActive[i] = false
      else {
        this.tabActive[i] = true
      }
    });
  }

  followUser() {
    if (!this.accountService.checkLoginStatus())
      this.router.navigate(['/login'], { queryParams: { returnUrl: this.router.url } })

    this.accountService.follow(this.profile.id, this.currentUser.id).subscribe(
      result => {
        this.profile.followers.push(result)
        this.followers = this.profile.followers.map(x => { return x.follower })
      }, error => {
        console.log(error)
      }
    )
  }

  unFollowUser() {
    this.accountService.unfollow(this.profile.id, this.currentUser.id).subscribe(
      result => {
        let index = this.profile.followers.findIndex(x => x.userID == result.userID && x.followerID == result.followerID)
        if (index > -1) {
          this.profile.followers.splice(index, 1)
          this.followers = this.profile.followers
            .map(x => {
              return x.follower
            })
        }
      }, error => {
        console.log(error)
      }
    )
  }

  get isOwnProfile(): boolean {
    return this.profile != null &&
      this.currentUser != null &&
      this.profile.id == this.currentUser.id
  }

  get pendingInvitations(): ProjectMembershipRequest[] {
    if (this.currentUser == null) return []

    return this.membershipRequests.filter(request =>
      request.type == "invitation" &&
      request.status == "pending" &&
      request.targetUserID == this.currentUser.id)
  }

  loadMembershipRequests() {
    if (!this.isOwnProfile) return

    this.projectService.getMyMembershipRequests().subscribe(
      result => {
        this.membershipRequests = result.filter(request =>
          request.type == "invitation" &&
          request.status == "pending" &&
          request.targetUserID == this.currentUser.id)
      }, error => {
        console.log(error)
      }
    )
  }

  acceptInvitation(request: ProjectMembershipRequest) {
    if (this.requestActionID != null) return
    this.requestActionID = request.projectMembershipRequestID

    this.projectService.acceptProjectMembershipRequest(request.projectMembershipRequestID).subscribe(
      result => {
        this.removeMembershipRequest(request.projectMembershipRequestID)
        this.addProjectUser(result)
        this.loadAcceptedProject(result)
      }, error => {
        console.log(error)
        this.requestActionID = null
      }
    )
  }

  rejectInvitation(request: ProjectMembershipRequest) {
    if (this.requestActionID != null) return
    this.requestActionID = request.projectMembershipRequestID

    this.projectService.rejectProjectMembershipRequest(request.projectMembershipRequestID).subscribe(
      result => {
        this.removeMembershipRequest(result.projectMembershipRequestID)
        this.requestActionID = null
      }, error => {
        console.log(error)
        this.requestActionID = null
      }
    )
  }

  private removeMembershipRequest(requestID: number) {
    this.membershipRequests = this.membershipRequests
      .filter(request => request.projectMembershipRequestID != requestID)
  }

  private addProjectUser(projectUser: ProjectUser) {
    let index = this.profile.projectUsers.findIndex(item => item.projectID == projectUser.projectID)
    if(index > -1) this.profile.projectUsers[index] = projectUser
    else this.profile.projectUsers.push(projectUser)
  }

  private loadAcceptedProject(projectUser: ProjectUser) {
    this.projectService.getProjectByID(projectUser.projectID).subscribe(
      project => {
        let index = this.projects.findIndex(item => item.projectID == project.projectID)
        if(index > -1) this.projects[index] = project
        else this.projects.push(project)
        this.requestActionID = null
      }, error => {
        console.log(error)
        this.requestActionID = null
      }
    )
  }

  loadProject(profile: User) {
    let projectIDs: number[] = profile.projectUsers.map(pu => pu.projectID)

    this.projectService.getProjectRange(projectIDs).subscribe(
      result => {

        // Map Project in Project User
        this.profile.projectUsers.map(pu => pu.project = result.find(p => p.projectID == pu.projectID))
        // Map Project
        this.projects = this.profile.projectUsers
          .filter(x => x.userRole != "follower")
          .map(x => x.project)
      }, error => {
        console.log(error)
      }
    )
  }

  loadFollower(profile: User) {
    let userIDs: number[] = profile.followers.map(f => f.followerID)

    this.accountService.getUserRange(userIDs).subscribe(
      result => {
        // Map Project in Project User
        this.profile.followers
          .map(f => f.follower = result.find(u => u.id == f.followerID))
        this.followers = this.profile.followers
          .map(x => x.follower)
      }, error => {
        console.log(error)
      }
    )
  }

  loadFollowing(profile: User) {
    let userIDs: number[] = profile.following.map(f => f.userID)

    this.accountService.getUserRange(userIDs).subscribe(
      result => {
        // Map Project in Project User
        this.profile.following
          .map(f => f.user = result.find(u => u.id == f.userID))
        this.followings = this.profile.following
          .map(x => x.user)
      }, error => {
        console.log(error)
      }
    )
  }

  get isFollowing(): boolean {
    if (this.profile != null && this.currentUser != null) {
      return this.profile.followers.some(x =>
        x.followerID == this.currentUser.id
      )
    }
    else {
      return false
    }
  }

}
