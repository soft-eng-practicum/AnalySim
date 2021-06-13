import { Component, OnInit, ViewChild, ViewChildren } from '@angular/core';
import { ActivatedRoute, Router, RouterStateSnapshot } from '@angular/router';
import { User } from 'src/app/interfaces/user';
import { Observable } from 'rxjs';
import { Project } from 'src/app/interfaces/project';
import { AccountService } from 'src/app/services/account.service';
import { ProjectService } from 'src/app/services/project.service';
import { ProjectFileExplorerComponent } from '../project-file-explorer/project-file-explorer.component';
import { ProjectUser } from 'src/app/interfaces/project-user';


@Component({
  selector: 'app-project',
  templateUrl: './project.component.html',
  styleUrls: ['./project.component.css']
})
export class ProjectComponent implements OnInit {

  constructor(
    private router : Router,
    private route: ActivatedRoute,
    private accountService : AccountService,
    private projectService : ProjectService) { }

  @ViewChildren(ProjectFileExplorerComponent) fileExplorer: ProjectFileExplorerComponent

  project : Project = null
  currentUser$ : Observable<User> = null
  currentUser : User = null
  projectUser : ProjectUser = null
  fileDirectory : string
  
  

  async ngOnInit() {
    if(this.accountService.checkLoginStatus()){
      await this.accountService.currentUser.then((x) => this.currentUser$ = x)
      this.currentUser$.subscribe(x => this.currentUser = x)
    }

    let owner = this.route.snapshot.params['owner']
    let projectname = this.route.snapshot.params['projectname']
    let projectUsers = this.route.snapshot.params['projectUsers']

    // Set Project
    this.projectService.getProjectByRoute(owner, projectname).subscribe(
      result =>{
        this.project = result
        if (this.currentUser != null && this.project.projectUsers.find(x => x.userID == this.currentUser.id) != undefined){
          this.projectUser = this.project.projectUsers.find(x => x.userID == this.currentUser.id)
        }
      }

    )

    console.log(this.route.snapshot)

    // Set Directory Param When First Load
    this.route.url.subscribe(segments =>{
      var newSegments = segments.filter(x => x.path != owner && x.path != projectname)

      if(newSegments.length == 0){
        this.fileDirectory = ""
      }
      else if(newSegments.join("/").indexOf(".") > -1){
        this.fileDirectory = newSegments.join("/")
      }
      // Join Param By Slash To Create Directory Path
      else{
        this.fileDirectory = newSegments.join("/") + "/"
      }
    });

  }

  get isFollowing() : boolean{
    if(this.currentUser == null) return false
    if(this.projectUser == null) return false
    if(this.projectUser.isFollowing == true) return true
    return false;
  }

  get isMember() : boolean{
    if(this.currentUser == null) return false
    if(this.projectUser == null) return false
    if(this.projectUser.userRole != "follower") return true
    return false;
  }

  get isOwner() : boolean{
    if(this.currentUser == null) return false
    if(this.projectUser == null) return false
    if(this.projectUser.userRole == "owner") return true
    return false;
  }

  getProjectUsers({user}){
    var userreturn = this.accountService.getUserByID(user)
    return userreturn
  }

  followProject(){
    // Navigate To Login Page If User Not Logged In
    if(!this.accountService.checkLoginStatus()){
      this.router.navigate(['/login'], {queryParams: {returnUrl : this.router.url}})
    }
    else{
      if(this.projectUser == null)
      {
        // Create Project User As Follower
        this.projectService.addUser(this.project.projectID, this.currentUser.id, "follower", true).subscribe(
          result =>{
            this.project.projectUsers.push(result) 
            this.projectUser = result;  
          }, error =>{
            console.log(error)
          }
        )
      }
      else{
        // Modify Project User And Set Following To True
        this.projectUser.isFollowing = true;     
        this.projectService.updateUser(this.projectUser).subscribe(
          result =>{
            let index = this.project.projectUsers.findIndex(pu => pu.userID == result.userID)
            this.project.projectUsers[index] = result
            this.projectUser = result;          
          }, error =>{
            console.log(error)
          }
        )
      }
    }
  }

  unFollowProject(){
    this.projectUser.isFollowing = false
    if(this.projectUser.userRole == "follower")
      this.projectService.removeUser(this.projectUser.projectID, this.projectUser.userID).subscribe(
        result => {
          let index = this.project.projectUsers.indexOf(result)
          this.project.projectUsers.splice(index, 1)
          this.projectUser = null
        }, error =>{
          console.log(error)
        }
      )
    else{
      this.projectService.updateUser(this.projectUser).subscribe(
        result => {
          let index = this.project.projectUsers.findIndex(pu => pu.userID == result.userID)
          this.project.projectUsers[index] = result
          this.projectUser = result 
        }, error =>{
          console.log(error)
        }
      )
    }
  }

  editProject(){
    alert("Edited!")
  }


  joinProject(){
    // Navigate To Login Page If User Not Logged In
    if(!this.accountService.checkLoginStatus()){
      this.router.navigate(['/login'], {queryParams: {returnUrl : this.router.url}})
    }
    else{
      if(this.projectUser == null)
      {
        // Create Project User
        this.projectService.addUser(this.project.projectID, this.currentUser.id, "member", false).subscribe(
          result =>{
            this.project.projectUsers.push(result) 
            this.projectUser = result;  
          }, error =>{
            console.log(error)
          }
        )
      }
      else{
        // Modify Project User
        this.projectUser.userRole = "member"
        this.projectService.updateUser(this.projectUser).subscribe(
          result =>{
            let index = this.project.projectUsers.findIndex(pu => pu.userID == result.userID)
            this.project.projectUsers[index] = result
            this.projectUser = result;          
          }, error =>{
            console.log(error)
          }
        )
      }
    }
  }

  leaveProject(){
    if(this.projectUser.isFollowing == false)
      this.projectService.removeUser(this.projectUser.projectID, this.projectUser.userID).subscribe(
        result => {
          let index = this.project.projectUsers.indexOf(result)
          this.project.projectUsers.splice(index, 1)
          this.projectUser = null
        }, error =>{
          console.log(error)
        }
      )
    else{
      this.projectUser.userRole = "follower"
      this.projectService.updateUser(this.projectUser).subscribe(
        result => {
          let index = this.project.projectUsers.findIndex(pu => pu.userID == result.userID)
          this.project.projectUsers[index] = result
          this.projectUser = result 
        }, error =>{
          console.log(error)
        }
      )
    }
  }

  forkProject(){
    if(!this.accountService.checkLoginStatus()){
      this.router.navigate(['/login'], {queryParams: {returnUrl : this.router.url}})
    }
  }


}
