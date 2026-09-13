import { Component, OnInit, SimpleChanges, TemplateRef, ViewChild, ViewChildren } from '@angular/core';
import { ActivatedRoute, Router, RouterStateSnapshot, NavigationEnd, NavigationError } from '@angular/router';
import { User } from 'src/app/interfaces/user';
import { catchError, map, Observable, of } from 'rxjs';
import { Project } from 'src/app/interfaces/project';
import { AccountService } from 'src/app/services/account.service';
import { ProjectService } from 'src/app/services/project.service';
import { ProjectFileExplorerComponent } from '../project-file-explorer/project-file-explorer.component';
import { ProjectUser } from 'src/app/interfaces/project-user';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { ExploreService } from 'src/app/services/explore.service';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { marked, Marked } from 'marked';
import hljs from 'highlight.js';
import { Notebook } from 'src/app/interfaces/notebook';
import { ProjectMembershipRequest } from 'src/app/interfaces/project-membership-request';


@Component({
  selector: 'app-project',
  templateUrl: './project.component.html',
  styleUrls: ['./project.component.scss']
})
export class ProjectComponent implements OnInit {

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private accountService: AccountService,
    private sanitizer: DomSanitizer,
    private projectService: ProjectService,
    private modalService: BsModalService,
    private exploreService: ExploreService
  ) { }

  @ViewChild('forkModal') forkModal: TemplateRef<any>
  @ViewChild('deleteModal') deleteModal: TemplateRef<any>
  @ViewChildren(ProjectFileExplorerComponent) fileExplorer: ProjectFileExplorerComponent
  @ViewChild('displayNotebookModal') displayNotebookModal: TemplateRef<any>;

  forkModalRef: BsModalRef;
  deleteModalRef: BsModalRef;
  displayNotebookModalRef: BsModalRef;

  project: Project = null
  currentUser$: Observable<User> = null
  currentUser: User = null
  projectUser: ProjectUser = null
  membershipRequests: ProjectMembershipRequest[] = []
  isFollowLoading: boolean = false
  isMembershipActionLoading: boolean = false
  fileDirectory: string
  forkedFrom: Project = null
  profileImageUrls: { [key: string]: SafeUrl } = {};
  notebookContent: any;
  versions: number[] = [];
  latestVersion: number = 1;
  readmeNotebook: Notebook; 
  isFull: boolean = false;

  toggleMoreOption: boolean = false
  toggleNotebookExpand: boolean = true
  toggleView: string = "File"
  showFiles: boolean = false;

  activeView: string = 'File';


  async ngOnInit() {
    if (this.accountService.checkLoginStatus()) {
      await this.accountService.currentUser.then((x) => this.currentUser$ = x)
      this.currentUser$.subscribe(x => {
        this.currentUser = x
        if (this.project != null) {
          this.projectUser = this.project.projectUsers.find(pu => pu.userID == this.currentUser.id)
          this.loadMembershipRequests()
        }
      })
    }

    this.route.params.subscribe(params => {


      let owner = params['owner']
      let projectname = params['projectname']
      let projectUsers = params['projectUsers']

      // Set Project
      this.projectService.getProjectByRoute(owner, projectname).subscribe(
        result => {
          this.project = result
          // console.log("project is : ", this.project);
          this.loadProfileImages();
          this.forkedFrom = null
          if (this.project.forkedFromProjectID != 0) {
            this.projectService.getProjectByID(this.project.forkedFromProjectID).subscribe(
              result => {
                this.forkedFrom = result
              }
            )
          }
          // console.log(this.project.forkedFromProjectID)
          this.projectUser = null
          if (this.currentUser != null && this.project.projectUsers.find(x => x.userID == this.currentUser.id) != undefined) {
            this.projectUser = this.project.projectUsers.find(x => x.userID == this.currentUser.id)
          }
          this.loadMembershipRequests()
          // console.log("Result : ", result);
          this.readmeNotebook = result.notebooks.filter((notebook) => notebook.name.toLowerCase() === "readme")[0];
          // console.log("readme : " ,this.readmeNotebook);
          this.projectService.getNotebookVersions(result.notebooks.filter((notebook) => notebook.name.toLowerCase() === "readme")[0]).subscribe(versions => {
            this.versions = versions;
            // console.log("Versions: ", this.versions);
            if (this.versions.length > 0) {
              this.latestVersion = this.versions[0]; // Default to the latest version
            }
            // console.log("the loatest version  : ", this.latestVersion);
            this.projectService.getNotebookFile(result.notebooks.filter((notebook) => notebook.name.toLowerCase() === "readme")[0], this.latestVersion).subscribe(
              notebookJson => {
                // console.log("the notebook content is : ", notebookJson);
                this.notebookContent = this.sanitizer.bypassSecurityTrustHtml(this.renderNotebook(notebookJson));
              });
          });
          // console.log("readme file is : ", result.notebooks.filter((notebook) => notebook.name.toLowerCase() === "readme")[0]);
        }

      )
      // console.log(this.route.snapshot)

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
        const view = this.fileDirectory.split('/')[0];
        if (view === "notebook") {
          this.toggleView = "Content";
          this.activeView = "Content";
        } else if (view == "comment") {
          this.toggleView = "Comment";
          this.activeView = "Comment";
        } else if (view == "log") {
          this.toggleView = "Log";
          this.activeView = "Log";
        } else if (view == "publications") {
          this.toggleView = "Publications";
          this.activeView = "Publications";
        }
      });
    })
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['project']) {
      this.loadProfileImages();
    }
  }

  NavigateToNotebook(){
    this.router.navigate([this.router.url.split('/').slice(0, 4).join('/') + "/notebook/" + this.readmeNotebook.name], {
      queryParams: {
        isNotebook: true,
        notebookId: this.readmeNotebook.notebookID,
        version: this.latestVersion,
      }, queryParamsHandling: 'merge'
    });
  }

  toggleNotebook() {
    this.isFull = !this.isFull;
  }

  closeDisplayNotebookModal() {
    this.displayNotebookModalRef.hide();
    this.router.navigate([this.router.url.split('/').slice(0,5).join('/')])
    this.projectService.getNotebookVersions(this.readmeNotebook).subscribe(versions => {
      this.versions = versions;
      // console.log("Versions: ", this.versions);
      if (this.versions.length > 0) {
        this.latestVersion = this.versions[0]; // Default to the latest version
      }
      // console.log("the loatest version  : ", this.latestVersion);
      this.projectService.getNotebookFile(this.readmeNotebook, this.latestVersion).subscribe(
        notebookJson => {
          // console.log("the notebook content is : ", notebookJson);
          this.notebookContent = this.sanitizer.bypassSecurityTrustHtml(this.renderNotebook(notebookJson));
        });
    });
  }

  renderNotebook(notebookJson: any): string {
    // console.log("notebook rendering content :" , notebookJson);
    let htmlContent = `<div class="notebookClass">`;
    for (const cell of notebookJson.cells) {
      htmlContent += '<div class="notebook-cell">';
      if (cell.cell_type === 'markdown') {
        const markdownContent = Array.isArray(cell.source) ? cell.source.join('') : cell.source;
        htmlContent += marked(markdownContent);
      } else if (cell.cell_type === 'code') {
        // console.log("error: ", hljs.highlight(cell.source, {language: 'python'}));
        const codeContent = Array.isArray(cell.source) ? cell.source.join('') : cell.source;
        htmlContent += '<pre><code><div>' + hljs.highlight(codeContent, { language: 'python' }).value + '</div></code></pre>';
        if (cell.outputs) {
          for (const output of cell.outputs) {
            if (output.data && output.data['text/html']) {
              const htmlOutput = Array.isArray(output.data['text/html']) ? output.data['text/html'].join('') : output.data['text/html'];
              htmlContent += htmlOutput;
            } else if (output.data && output.data['image/png']) {
              htmlContent += `<img src="data:image/png;base64,${output.data['image/png']}" />`;
            } else if (output.data && output.data['text/plain']) {
              const plainTextOutput = Array.isArray(output.data['text/plain']) ? output.data['text/plain'].join('') : output.data['text/plain'];
              htmlContent += '<pre>' + plainTextOutput + '</pre>';
            }
            else if (output.text) {
              const outputText = Array.isArray(output.text) ? output.text.join('') : output.text;
              htmlContent += '<pre>' + outputText + '</pre>';
            }
          }
        }
      }
      htmlContent += '</div>';
    }
    htmlContent += '</div>';
    return htmlContent;
  }

  loadProfileImages(): void {
    if (this.project && this.project.projectUsers) {
      this.project.projectUsers.forEach(member => {
        // console.log("the member is : ", member)
        this.loadProfileImage(member.user);
      });
    }
  }

  loadProfileImage(user: User): void {
    if (user.id) {
      this.accountService.getProfileImage(user.id).subscribe(
        blobFile => {
          if (blobFile) {
            this.projectService.downloadFile(blobFile.blobFileID).subscribe(
              imageBlob => {
                if (imageBlob) {
                  const objectURL = URL.createObjectURL(imageBlob);
                  this.profileImageUrls[user.userName] = this.sanitizer.bypassSecurityTrustUrl(objectURL);
                } else {
                  this.setDefaultImage(user.userName);
                }
              },
              error => {
                console.error('Error fetching profile image:', error);
                this.setDefaultImage(user.userName);
              }
            );
          } else {
            this.setDefaultImage(user.userName);
          }
        },
        error => {
          console.error('Error fetching profile image:', error);
          this.setDefaultImage(user.userName);
        }
      );
    } else {
      this.setDefaultImage(user.userName);
    }
  }

  setDefaultImage(userName: string): void {
    this.profileImageUrls[userName] = "../../assets/img/default-profile.png";
    // console.log("the user is : ", userName, " and the image is : ", this.profileImageUrls[userName])
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

  get pendingJoinRequest(): ProjectMembershipRequest {
    if (this.project == null || this.currentUser == null) return null
    return this.membershipRequests.find(request =>
      request.projectID == this.project.projectID &&
      request.targetUserID == this.currentUser.id &&
      request.type == "join_request" &&
      request.status == "pending")
  }

  get pendingInvitation(): ProjectMembershipRequest {
    if (this.project == null || this.currentUser == null) return null
    return this.membershipRequests.find(request =>
      request.projectID == this.project.projectID &&
      request.targetUserID == this.currentUser.id &&
      request.type == "invitation" &&
      request.status == "pending")
  }

  loadMembershipRequests(): void {
    if (this.currentUser == null || this.project == null) return

    this.projectService.getMyMembershipRequests().subscribe(
      result => {
        this.membershipRequests = result.filter(request => request.projectID == this.project.projectID)
      }, error => {
        console.log(error)
      }
    )
  }

  private removeMembershipRequest(requestID: number): void {
    this.membershipRequests = this.membershipRequests.filter(request => request.projectMembershipRequestID != requestID)
  }

  getProjectUsers({ user }) {
    var userreturn = this.accountService.getUserByID(user)
    return userreturn
  }

  followProject() {
    if (this.isFollowLoading) return

    // Navigate To Login Page If User Not Logged In
    if (!this.accountService.checkLoginStatus()) {
      this.router.navigate(['/login'], { queryParams: { returnUrl: this.router.url } })
    }
    else {
      this.isFollowLoading = true

      const prevProjectUsers = [...this.project.projectUsers]
      const prevProjectUser = this.projectUser

      if (this.projectUser == null) {
        const placeholder: ProjectUser = {
          projectID: this.project.projectID,
          userID: this.currentUser.id,
          userRole: 'follower',
          isFollowing: true,
          user: this.currentUser
        } as any

        this.project.projectUsers.push(placeholder)
        this.projectUser = placeholder

        this.projectService.followProject(this.project.projectID).subscribe(result => {
          this.project.projectUsers = this.project.projectUsers.map(pu => pu.userID == result.userID ? result : pu)
          this.projectUser = result
          this.isFollowLoading = false
        }, error => {
          console.log(error)
          this.project.projectUsers = prevProjectUsers
          this.projectUser = prevProjectUser
          this.isFollowLoading = false
        })
      }
      else {
        const prev = this.projectUser.isFollowing
        this.projectUser.isFollowing = true

        this.projectService.followProject(this.project.projectID).subscribe(result => {
          let index = this.project.projectUsers.findIndex(pu => pu.userID == result.userID)
          if (index > -1) this.project.projectUsers[index] = result
          this.projectUser = result;
          this.isFollowLoading = false
        }, error => {
          console.log(error)
          this.projectUser.isFollowing = prev
          this.isFollowLoading = false
        })
      }
    }
  }

  unFollowProject() {
    if (this.isFollowLoading) return
    if(!this.projectUser) return

    this.isFollowLoading = true

    const prevProjectUsers = [...this.project.projectUsers]
    const prevProjectUser = { ...this.projectUser }

    if (this.projectUser.userRole == "follower"){
      const idx = this.project.projectUsers.findIndex(pu => pu.userID == this.projectUser.userID)
      if(idx > -1) this.project.projectUsers.splice(idx, 1)
      this.projectUser = null

      this.projectService.unfollowProject(prevProjectUser.projectID).subscribe(result =>{
        this.isFollowLoading = false
      }, error =>{
        console.log(error)
        this.project.projectUsers = prevProjectUsers
        this.projectUser = prevProjectUser
        this.isFollowLoading = false
      })
    }
    else {
      this.projectUser.isFollowing = false
      this.projectService.unfollowProject(this.projectUser.projectID).subscribe(result => {
        let index = this.project.projectUsers.findIndex(pu => pu.userID == result.userID)
        if(index > -1) this.project.projectUsers[index] = result
        this.projectUser = result
        this.isFollowLoading = false
      }, error => {
        console.log(error)
        this.projectUser = prevProjectUser
        this.isFollowLoading = false
      })
    }
  }

  editProject() {
    if (!this.project) return;

    const [owner, projectname] = this.project.route.split('/');
    this.router.navigate(['/project', owner, projectname, 'edit']);
  }


  joinProject() {
    if (this.isMembershipActionLoading) return

    // Navigate To Login Page If User Not Logged In
    if (!this.accountService.checkLoginStatus()) {
      this.router.navigate(['/login'], { queryParams: { returnUrl: this.router.url } })
    }
    else {
      this.isMembershipActionLoading = true
      this.projectService.requestJoinProject(this.project.projectID).subscribe(
        result => {
          this.membershipRequests = this.membershipRequests
            .filter(request => request.projectMembershipRequestID != result.projectMembershipRequestID)
          this.membershipRequests.push(result)
          this.isMembershipActionLoading = false
        }, error => {
          console.log(error)
          this.isMembershipActionLoading = false
        }
      )
    }
  }

  cancelJoinRequest() {
    if (this.isMembershipActionLoading || this.pendingJoinRequest == null) return

    this.isMembershipActionLoading = true
    const requestID = this.pendingJoinRequest.projectMembershipRequestID

    this.projectService.cancelProjectMembershipRequest(requestID).subscribe(
      result => {
        this.removeMembershipRequest(result.projectMembershipRequestID)
        this.isMembershipActionLoading = false
      }, error => {
        console.log(error)
        this.isMembershipActionLoading = false
      }
    )
  }

  acceptInvitation() {
    if (this.isMembershipActionLoading || this.pendingInvitation == null) return

    this.isMembershipActionLoading = true
    const requestID = this.pendingInvitation.projectMembershipRequestID

    this.projectService.acceptProjectMembershipRequest(requestID).subscribe(
      result => {
        let index = this.project.projectUsers.findIndex(pu => pu.userID == result.userID)
        if (index > -1) this.project.projectUsers[index] = result
        else this.project.projectUsers.push(result)

        this.projectUser = result
        this.removeMembershipRequest(requestID)
        this.isMembershipActionLoading = false
      }, error => {
        console.log(error)
        this.isMembershipActionLoading = false
      }
    )
  }

  rejectInvitation() {
    if (this.isMembershipActionLoading || this.pendingInvitation == null) return

    this.isMembershipActionLoading = true

    this.projectService.rejectProjectMembershipRequest(this.pendingInvitation.projectMembershipRequestID).subscribe(
      result => {
        this.removeMembershipRequest(result.projectMembershipRequestID)
        this.isMembershipActionLoading = false
      }, error => {
        console.log(error)
        this.isMembershipActionLoading = false
      }
    )
  }

  leaveProject() {
    if (this.isMembershipActionLoading) return
    if(!this.projectUser) return

    this.isMembershipActionLoading = true
    const wasFollowing = this.projectUser.isFollowing

    this.projectService.leaveProject(this.projectUser.projectID).subscribe(
      result => {
        let index = this.project.projectUsers.findIndex(pu => pu.userID == result.userID)

        if (wasFollowing) {
          if (index > -1) this.project.projectUsers[index] = result
          this.projectUser = result
        }
        else {
          if (index > -1) this.project.projectUsers.splice(index, 1)
          this.projectUser = null
        }
        this.isMembershipActionLoading = false
      }, error => {
        console.log(error)
        this.isMembershipActionLoading = false
      }
    )
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

  showFile(): void {
    this.activeView = 'File';
    this.toggleView = 'File';
  }

  showPublication(): void {
    this.activeView = 'Publications';
    this.toggleView = 'Publications';
  }
  showLog(): void {
    this.activeView = 'Log';
    this.toggleView = 'Log';
  }
  showNotebooks(): void {
    this.activeView = 'Content';
    this.toggleView = 'Content';
  }
  showComments(): void {
    this.activeView = 'Comment';
    this.toggleView = 'Comment';
  }

  exploreTag(tagValue: string){
    this.exploreService.exploreProject(tagValue);
  }
}

// deleteProject(){
//   this.projectService.deleteProject(this.project.projectID).subscribe(
//     result => {
//     }, error =>{
//       console.log(error)
//     }
//   )
// }
//}
