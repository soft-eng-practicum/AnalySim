import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AccountService } from '../services/account.service';
import { ApplicationUser } from '../interfaces/user';
import { Project } from '../interfaces/project';
import { ProjectService } from '../services/project.service';
import { of, pipe } from 'rxjs';
import { take } from 'rxjs/operators';
import { UserUser } from '../interfaces/user-user';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {

  constructor(private route : ActivatedRoute,
    private router : Router, 
    private accountService : AccountService,
    private projectService : ProjectService) { }

  profile : ApplicationUser
  projects : Project[]
  followings : ApplicationUser[]
  followers : ApplicationUser[]
  
  tabActive : boolean[] = [true, false, false]
  showError : boolean

  currentUser : ApplicationUser

  
  ngOnInit(){
    
    this.accountService.currentUser.subscribe(result => this.currentUser = result)

    this.route.params.subscribe( params => {
      this.profile = undefined
      this.projects = []
      this.followings = []
      this.followers = []
      this.showError = false


      let username = params["username"]
      this.accountService.getUserByName(username)
      .subscribe(
        result => {
          this.profile = result
          this.loadProject(result)
          this.loadFollowing(result)
          this.loadFollower(result)
        }, error =>{
          this.showError = true
      })
    })
    
  }

  changeTab(num : number)
  {
    this.tabActive.forEach((t,i) => {
      if(num != i)
        this.tabActive[i] = false
      else {
        this.tabActive[i] = true
      }
    }); 
  }

  followUser(){
    if(!this.accountService.checkLoginStatus())
      this.router.navigate(['/login'])

    this.accountService.follow(this.profile.id, this.currentUser.id).subscribe(
      result =>{
        this.profile.followers.push(result)
        this.followers = this.profile.followers.map(x => {return x.follower})
      }, error =>{
        console.log(error)
      }
    )
  }

  unFollowUser(){
    this.accountService.unfollow(this.profile.id, this.currentUser.id).subscribe(
      result =>{
        
        let index = this.profile.followers.findIndex(x => x.userID == result.userID && x.followerID == result.followerID)
        if (index > -1) {
          this.profile.followers.splice(index, 1)
          this.followers = this.profile.followers
            .map(x => {
              return x.follower
            })
        }
      }, error =>{
        console.log(error)
      }
    )
  }

  loadProject(profile : ApplicationUser){
    let projectIDs : number[] = profile.projectUsers.map(pu => pu.projectID)
    
    this.projectService.getProjectRange(projectIDs).subscribe(
      result =>{
        
        // Map Project in Project User
        this.profile.projectUsers.map(pu => pu.project = result.find(p => p.projectID == pu.projectID))
        // Map Project
        this.projects = this.profile.projectUsers
          .filter(x => x.userRole != "follower")
          .map(x => x.project)
      }, error =>{
        console.log(error)
      }
    )
  }

  loadFollower(profile : ApplicationUser){
    let userIDs : number[] = profile.followers.map(f => f.followerID)

    this.accountService.getUserRange(userIDs).subscribe(
      result =>{
        // Map Project in Project User
        this.profile.followers
          .map(f => f.follower = result.find(u => u.id == f.followerID))
        this.followers = this.profile.followers
          .map(x => x.follower)
      }, error =>{
        console.log(error)
      }
    )
  }

  loadFollowing(profile : ApplicationUser){
    let userIDs : number[] = profile.following.map(f => f.userID)

    this.accountService.getUserRange(userIDs).subscribe(
      result =>{
        // Map Project in Project User
        this.profile.following
          .map(f => f.user = result.find(u => u.id == f.userID))
        this.followings = this.profile.following
          .map(x => x.user)
      }, error =>{
        console.log(error)
      }
    )
  }

  get isFollowing() : boolean{
    if(this.profile != null && this.currentUser != null)
    {
      return this.profile.followers.some(x =>
        x.followerID == this.currentUser.id  
      )
    }
    else {
      return false
    }
  }

}
