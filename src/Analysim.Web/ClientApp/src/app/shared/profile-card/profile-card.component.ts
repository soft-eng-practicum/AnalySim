import { Component, OnInit, Input } from '@angular/core';
import { User } from 'src/app/interfaces/user';
import { AccountService } from 'src/app/services/account.service';
import { ProjectService } from 'src/app/services/project.service';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-profile-card',
  templateUrl: './profile-card.component.html',
  styleUrls: ['./profile-card.component.scss']
})
export class ProfileCardComponent implements OnInit {

  @Input() profile : User;
  currentUser$ : Observable<User>;
  currentUser : User = null;
  profileImageUrl: SafeUrl;

  constructor(
    private accountService: AccountService,
    private router: Router,
    private projectService: ProjectService,
    private sanitizer: DomSanitizer
  ) { }

  async ngOnInit() {
    if(this.accountService.checkLoginStatus()){
      await this.accountService.currentUser.then((x) => this.currentUser$ = x)
      this.currentUser$.subscribe(x => this.currentUser = x)
    }
    this.loadProfileImage();
  }

  loadProfileImage() {
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
    else {
      this.profileImageUrl = "../../assets/img/default-profile.png";
    }
  }

  get isFollowing() : boolean{
    if(this.currentUser == null) return false
    if(this.profile.followers.findIndex(x => x.followerID === this.currentUser.id) > -1) return true
    return false;
  }

  followUser(){
    if(!this.accountService.checkLoginStatus())
      this.router.navigate(['/login'], {queryParams: {returnUrl : this.router.url}})

    this.accountService.follow(this.profile.id, this.currentUser.id).subscribe(
      result =>{
        this.profile.followers.push(result)
      }, error =>{
        console.log(error)
      }
    )
  }

  unFollowUser(){
    this.accountService.unfollow(this.profile.id, this.currentUser.id).subscribe(
        result => {
          const index = this.profile.followers.findIndex(userFollower =>
            userFollower.userID === result.userID && userFollower.followerID === result.followerID
          );

          if (index > -1) {
            this.profile.followers.splice(index, 1);
          }
        }, error => {
          console.log(error);
        }
      );
  }

}
