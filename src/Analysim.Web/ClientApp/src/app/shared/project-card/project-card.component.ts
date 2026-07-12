import { Component, OnInit, Input } from '@angular/core';
import { Project } from 'src/app/interfaces/project';
import { ProjectService } from 'src/app/services/project.service';
import { AccountService } from 'src/app/services/account.service';
import { Router } from '@angular/router';
import { ProjectUser } from 'src/app/interfaces/project-user';
import { Observable } from 'rxjs';
import { User } from 'src/app/interfaces/user';
import { of, } from 'rxjs';
import { map, switchAll } from 'rxjs/operators';
import { ExploreService } from 'src/app/services/explore.service';


@Component({
  selector: 'app-project-card',
  templateUrl: './project-card.component.html',
  styleUrls: ['./project-card.component.scss']
})
export class ProjectCardComponent implements OnInit {

  constructor(
    private projectService : ProjectService,
    private accountService : AccountService,
    private exploreService : ExploreService,
    private router : Router
    ) { }

  @Input() project : Project;

  currentUser$ : Observable<User>
  currentUser : User = null
  projectUser : ProjectUser = null
  isFollowLoading: boolean = false

  async ngOnInit() {
    // Get User And Check For Project User Match
    if(this.accountService.checkLoginStatus()){
      await this.accountService.currentUser.then((x) => this.currentUser$ = x)
      this.currentUser$.subscribe(x => this.currentUser = x)
      this.projectUser = this.project.projectUsers.find(x => x.userID == this.currentUser.id) || null
    }
  }

  get isFollowing() : boolean{
    if(this.currentUser == null) return false
    if(this.projectUser == null) return false
    if(this.projectUser.isFollowing == true) return true
    return false;
  }

  async displayUsers(){
  
    var projectmembers = []
    var myObj = this.project.projectUsers;


      await (myObj).forEach(element => { 
      this.accountService.getUserByID(element.userID).subscribe(
       user => {projectmembers.push(user.userName)
      console.log(user.userName)})
      projectmembers.push(element.userID)

     });
     alert(projectmembers)
    console.log(projectmembers)
    var results = this.accountService.getUserRange(projectmembers)
    console.log(results)


  }


  
  displayUsers1(){

    var projectmembers = []

    of((this.accountService.getUserByID(1),
    this.accountService.getUserByID(2)).subscribe(
      user => {projectmembers.push(user.userName)
     console.log(projectmembers)})

    )
  }
      
  displayUsers2(){

    var projectmembers = []

    of((this.accountService.getUserByID(1),
    this.accountService.getUserByID(2)).subscribe(
      user => {projectmembers.push(user.userName)
     console.log(projectmembers)})

    )
  }


/*
    displayUserTest(){
      map(userID => this.accountService.getUserByID(userID))(of(this.project.projectUsers)).subscribe(user => console.log(user.userName));

    }
    */


  followProject(){
    // Navigate To Login Page If User Not Logged In
    if(!this.accountService.checkLoginStatus()){
      this.router.navigate(['/login'], {queryParams: {returnUrl : this.router.url}})
      return
    }

    this.isFollowLoading = true

    const prevProjectUsers = [...this.project.projectUsers]
    const prevProjectUser = this.projectUser

    if(this.projectUser == null)
    {
      // optimistic placeholder
      const placeholder: ProjectUser = {
        projectID: this.project.projectID,
        userID: this.currentUser.id,
        userRole: 'follower',
        isFollowing: true,
        user: this.currentUser
      } as any

      this.project.projectUsers.push(placeholder)
      this.projectUser = placeholder

      this.projectService.followProject(this.project.projectID).subscribe(result =>{
        const idx = this.project.projectUsers.findIndex(pu => pu.userID == result.userID)
        if(idx > -1) this.project.projectUsers[idx] = result
        this.projectUser = result
        this.isFollowLoading = false
      }, error =>{
        console.log(error)
        this.project.projectUsers = prevProjectUsers
        this.projectUser = prevProjectUser
        this.isFollowLoading = false
      })
    }
    else{
      // optimistic toggle
      const prev = this.projectUser.isFollowing
      this.projectUser.isFollowing = true

      this.projectService.followProject(this.project.projectID).subscribe(result =>{
        let index = this.project.projectUsers.findIndex(pu => pu.userID == result.userID)
        if(index > -1) this.project.projectUsers[index] = result
        this.projectUser = result
        this.isFollowLoading = false
      }, error =>{
        console.log(error)
        this.projectUser.isFollowing = prev
        this.isFollowLoading = false
      })
    }
  }


  unFollowProject(){
    if(!this.projectUser) return

    this.isFollowLoading = true

    const prevProjectUsers = [...this.project.projectUsers]
    const prevProjectUser = { ...this.projectUser }

    if(this.projectUser.userRole == "follower"){
      // optimistic remove
      const idx = this.project.projectUsers.findIndex(pu => pu.userID == this.projectUser.userID)
      if(idx > -1) this.project.projectUsers.splice(idx, 1)
      this.projectUser = null

      this.projectService.unfollowProject(prevProjectUser.projectID).subscribe(result =>{
        // nothing to do, server handled removal or returned updated row
        this.isFollowLoading = false
      }, error =>{
        console.log(error)
        this.project.projectUsers = prevProjectUsers
        this.projectUser = prevProjectUser
        this.isFollowLoading = false
      })
    }
    else{
      // user is member/owner — set isFollowing = false
      this.projectUser.isFollowing = false
      this.projectService.unfollowProject(this.projectUser.projectID).subscribe(result =>{
        const i = this.project.projectUsers.findIndex(pu => pu.userID == result.userID)
        if(i > -1) this.project.projectUsers[i] = result
        this.projectUser = result
        this.isFollowLoading = false
      }, error =>{
        console.log(error)
        this.projectUser = prevProjectUser
        this.isFollowLoading = false
      })
    }
  }

  exploreTag(tagValue: string){
    this.exploreService.exploreProject(tagValue);
  }
}
