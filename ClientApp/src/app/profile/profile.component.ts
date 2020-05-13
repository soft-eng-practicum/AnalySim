import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AccountService } from '../services/account.service';
import { ApplicationUser } from '../interfaces/user';
import { Project } from '../interfaces/project';
import { ProjectService } from '../services/project.service';

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
  profileImage : string = null
  projects : Project[] = null
  followers : ApplicationUser[] = null
  followings : ApplicationUser[] = null
  tabActive : boolean[] = [true, false, false]
  userID : number
  showError : boolean = false
  
  
  ngOnInit(): void {
    this.accountService.currentUserID.subscribe(result => this.userID = result)

    let username = this.route.snapshot.params['username']
    this.accountService.getUserByName(username).subscribe(
      result => {
        this.profileImage = this.accountService.getProfileImage(result);
        this.profile = result
        this.loadTabContent(0)
        
      }, error =>{
        console.log(error)
        this.showError = true;
      }
    )
  }

  loadTabContent(num : number){
    switch(num){
      case 0:
        if(this.projects == null)
        {
          this.accountService.getProjectList(this.profile.id).subscribe(
            result => {
              this.projects = result       
            }, error =>{
              console.log(error)
            }
          )
        }       
        break;
      case 1:
        if(this.followings == null)
        {
          this.accountService.getFollowing(this.profile.id).subscribe(
            result => {
              console.log(result)
              this.followings = result       
            }, error =>{
              console.log(error)
            }
          )
        }
        break;
      case 2:
        if(this.followers == null)
        {
          this.accountService.getFollower(this.profile.id).subscribe(
            result => {
              console.log(result)
              this.followers = result       
            }, error =>{
              console.log(error)
            }
          )
        }
        break;
      default:
        console.log("Error")
        break;
    }
  }

  changeTab(num : number)
  {
    this.tabActive.forEach((t,i) => {
      {
        if(num != i)
          this.tabActive[i] = false
        else
        {
          this.tabActive[i] = true
          this.loadTabContent(i)
        }
          
      }
    }); 
  }

  followUser(){
    if(!this.accountService.checkLoginStatus())
      this.router.navigate(['/login'])

    this.accountService.follow(this.profile.id, this.userID).subscribe(
      result =>{
        this.reloadUser(result.userID)
      }, error =>{
        console.log(error)
      }
    )
  }

  unFollowUser(){
    this.accountService.unfollow(this.profile.id, this.userID).subscribe(
      result =>{
        this.reloadUser(result.userID)       
      }, error =>{
        console.log(error)
      }
    )
  }

  reloadUser(profileID : number){
    this.accountService.getUserByID(profileID).subscribe(
      result =>{
        this.profile = result
      }, error =>{
        console.log(error)
      }
    )
  }

  get isFollowing() : boolean{
    if(this.profile != null)
    {
      return this.profile.followers.some(x =>
        x.followerID == this.userID  
      )
    }
    else {
      return false
    }
  }

}
