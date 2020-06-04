import { Component, OnInit, Input } from '@angular/core';
import { ApplicationUser } from 'src/app/interfaces/user';
import { AccountService } from 'src/app/services/account.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-profile-card',
  templateUrl: './profile-card.component.html',
  styleUrls: ['./profile-card.component.css']
})
export class ProfileCardComponent implements OnInit {

  constructor(private accountService : AccountService,
    private router : Router) { }

  @Input() profile : ApplicationUser
  currentUser : ApplicationUser = null
  isFollowing : boolean = false

  ngOnInit() {
    if(this.accountService.checkLoginStatus()){
      this.accountService.currentUser.subscribe(
        result => {
            this.currentUser = result
            this.isFollowing = this.profile.followers.some(x => x.followerID == this.currentUser.id)
        }
      )
    }
  }

  followUser(){
    if(!this.accountService.checkLoginStatus())
      this.router.navigate(['/login'])

    this.accountService.follow(this.profile.id, this.currentUser.id).subscribe(
      result =>{
        this.isFollowing = true
        this.profile.followers.push(result)
      }, error =>{
        console.log(error)
      }
    )
  }

  unFollowUser(){
    this.accountService.unfollow(this.profile.id, this.currentUser.id).subscribe(
      result =>{
        this.isFollowing = false
        let index = this.profile.followers.indexOf(result)
        this.profile.followers.splice(index, 1)      
      }, error =>{
        console.log(error)
      }
    )
  }

}
