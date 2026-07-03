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
  @ViewChild('memberListModal') memberListModal: TemplateRef<any>
  @ViewChildren(ProjectFileExplorerComponent) fileExplorer: ProjectFileExplorerComponent
  @ViewChild('displayNotebookModal') displayNotebookModal: TemplateRef<any>;

  forkModalRef: BsModalRef;
  deleteModalRef: BsModalRef;
  memberListModalRef: BsModalRef;
  displayNotebookModalRef: BsModalRef;

  project: Project = null
  currentUser$: Observable<User> = null
  currentUser: User = null
  projectUser: ProjectUser = null
  isFollowLoading: boolean = false
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
          if (this.currentUser != null && this.project.projectUsers.find(x => x.userID == this.currentUser.id) != undefined) {
            this.projectUser = this.project.projectUsers.find(x => x.userID == this.currentUser.id)
          }
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
    this.displayNotebookModalRef = this.modalService.show(this.displayNotebookModal, {
      backdrop: 'static',
    });

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

  toggleModalMemberList() {
    // Show delete Modal
    this.memberListModalRef = this.modalService.show(this.memberListModal)
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
