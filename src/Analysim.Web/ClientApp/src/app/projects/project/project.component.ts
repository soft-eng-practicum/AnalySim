import { Component, OnInit, TemplateRef, ViewChild, ViewChildren } from '@angular/core';
import { ActivatedRoute, Router, RouterStateSnapshot } from '@angular/router';
import { User } from 'src/app/interfaces/user';
import { Observable } from 'rxjs';
import { Project } from 'src/app/interfaces/project';
import { AccountService } from 'src/app/services/account.service';
import { ProjectService } from 'src/app/services/project.service';
import { ProjectFileExplorerComponent } from '../project-file-explorer/project-file-explorer.component';
import { ProjectUser } from 'src/app/interfaces/project-user';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';


@Component({
  selector: 'app-project',
  templateUrl: './project.component.html',
  styleUrls: ['./project.component.css']
})
export class ProjectComponent implements OnInit {

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private accountService: AccountService,
    private projectService: ProjectService,
    private modalService: BsModalService,) { }

  @ViewChild('forkModal') forkModal: TemplateRef<any>
  @ViewChild('deleteModal') deleteModal: TemplateRef<any>
  @ViewChildren(ProjectFileExplorerComponent) fileExplorer: ProjectFileExplorerComponent

  forkModalRef: BsModalRef;
  deleteModalRef: BsModalRef;

  project: Project = null
  currentUser$: Observable<User> = null
  currentUser: User = null
  projectUser: ProjectUser = null
  fileDirectory: string
  forkedFrom: Project = null



  async ngOnInit() {
    if (this.accountService.checkLoginStatus()) {
      await this.accountService.currentUser.then((x) => this.currentUser$ = x)
      this.currentUser$.subscribe(x => this.currentUser = x)
    }

    this.route.params.subscribe(params => {

      let owner = params['owner']
      let projectname = params['projectname']
      let projectUsers = params['projectUsers']

      // Set Project
      this.projectService.getProjectByRoute(owner, projectname).subscribe(
        result => {
          this.project = result
          this.forkedFrom = null
          if (this.project.forkedFromProjectID != 0) {
            this.projectService.getProjectByID(this.project.forkedFromProjectID).subscribe(
              result => {
                this.forkedFrom = result
              }
            )
          }
          console.log(this.project.forkedFromProjectID)
          if (this.currentUser != null && this.project.projectUsers.find(x => x.userID == this.currentUser.id) != undefined) {
            this.projectUser = this.project.projectUsers.find(x => x.userID == this.currentUser.id)
          }
        }

      )
      console.log(this.route.snapshot)

      // Set Directory Param When First Load
      this.route.url.subscribe(segments => {
        var newSegments = segments.filter(x => x.path != owner && x.path != projectname)

        if (newSegments.length == 0) {
          this.fileDirectory = ""
        }
        else if (newSegments.join("/").indexOf(".") > -1) {
          this.fileDirectory = newSegments.join("/")
        }
        // Join Param By Slash To Create Directory Path
        else {
          this.fileDirectory = newSegments.join("/") + "/"
        }
      });
    })
  }

  get isFollowing(): boolean {
    if (this.currentUser == null) return false
    if (this.projectUser == null) return false
    if (this.projectUser.isFollowing == true) return true
    return false;
  }

  get isMember(): boolean {
    if (this.currentUser == null) return false
    if (this.projectUser == null) return false
    if (this.projectUser.userRole != "follower") return true
    return false;
  }

  get isOwner(): boolean {
    if (this.currentUser == null) return false
    if (this.projectUser == null) return false
    if (this.projectUser.userRole == "owner") return true
    return false;
  }

  getProjectUsers({ user }) {
    var userreturn = this.accountService.getUserByID(user)
    return userreturn
  }

  followProject() {
    // Navigate To Login Page If User Not Logged In
    if (!this.accountService.checkLoginStatus()) {
      this.router.navigate(['/login'], { queryParams: { returnUrl: this.router.url } })
    }
    else {
      if (this.projectUser == null) {
        // Create Project User As Follower
        this.projectService.addUser(this.project.projectID, this.currentUser.id, "follower", true).subscribe(
          result => {
            this.project.projectUsers.push(result)
            this.projectUser = result;
          }, error => {
            console.log(error)
          }
        )
      }
      else {
        // Modify Project User And Set Following To True
        this.projectUser.isFollowing = true;
        this.projectService.updateUser(this.projectUser).subscribe(
          result => {
            let index = this.project.projectUsers.findIndex(pu => pu.userID == result.userID)
            this.project.projectUsers[index] = result
            this.projectUser = result;
          }, error => {
            console.log(error)
          }
        )
      }
    }
  }

  unFollowProject() {
    this.projectUser.isFollowing = false
    if (this.projectUser.userRole == "follower")
      this.projectService.removeUser(this.projectUser.projectID, this.projectUser.userID).subscribe(
        result => {
          let index = this.project.projectUsers.indexOf(result)
          this.project.projectUsers.splice(index, 1)
          this.projectUser = null
        }, error => {
          console.log(error)
        }
      )
    else {
      this.projectService.updateUser(this.projectUser).subscribe(
        result => {
          let index = this.project.projectUsers.findIndex(pu => pu.userID == result.userID)
          this.project.projectUsers[index] = result
          this.projectUser = result
        }, error => {
          console.log(error)
        }
      )
    }
  }

  editProject() {
    alert("Edited!")
  }


  joinProject() {
    // Navigate To Login Page If User Not Logged In
    if (!this.accountService.checkLoginStatus()) {
      this.router.navigate(['/login'], { queryParams: { returnUrl: this.router.url } })
    }
    else {
      if (this.projectUser == null) {
        // Create Project User
        this.projectService.addUser(this.project.projectID, this.currentUser.id, "member", false).subscribe(
          result => {
            this.project.projectUsers.push(result)
            this.projectUser = result;
          }, error => {
            console.log(error)
          }
        )
      }
      else {
        // Modify Project User
        this.projectUser.userRole = "member"
        this.projectService.updateUser(this.projectUser).subscribe(
          result => {
            let index = this.project.projectUsers.findIndex(pu => pu.userID == result.userID)
            this.project.projectUsers[index] = result
            this.projectUser = result;
          }, error => {
            console.log(error)
          }
        )
      }
    }
  }

  leaveProject() {
    if (this.projectUser.isFollowing == false)
      this.projectService.removeUser(this.projectUser.projectID, this.projectUser.userID).subscribe(
        result => {
          let index = this.project.projectUsers.indexOf(result)
          this.project.projectUsers.splice(index, 1)
          this.projectUser = null
        }, error => {
          console.log(error)
        }
      )
    else {
      this.projectUser.userRole = "follower"
      this.projectService.updateUser(this.projectUser).subscribe(
        result => {
          let index = this.project.projectUsers.findIndex(pu => pu.userID == result.userID)
          this.project.projectUsers[index] = result
          this.projectUser = result
        }, error => {
          console.log(error)
        }
      )
    }
  }

  forkProject() {
    // if user is not log in
    if (!this.accountService.checkLoginStatus()) {
      this.router.navigate(['/login'], { queryParams: { returnUrl: this.router.url } })
    } else {
      this.toggleModalFork()//fork model pops up
    }
  }

  toggleModalFork() {
    console.log("toggled...")
    // Show Rename Modal
    this.forkModalRef = this.modalService.show(this.forkModal)
  }

  deleteProject() {
    // if user is not log in
    if (!this.accountService.checkLoginStatus()) {
      this.router.navigate(['/login'], { queryParams: { returnUrl: this.router.url } })
    } else {
      this.toggleModalDelete()// delete modal pops up
    }
  }

  toggleModalDelete() {
    // Show delete Modal
    this.deleteModalRef = this.modalService.show(this.deleteModal)
  }
}
