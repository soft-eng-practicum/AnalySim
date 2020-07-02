import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, FormBuilder } from '@angular/forms';
import { AccountService } from 'src/app/services/account.service';
import { Router } from '@angular/router';
import { ApplicationUser } from 'src/app/interfaces/user';
import { from, Observable } from 'rxjs';
import { NotificationService } from 'src/app/services/notification.service';

@Component({
  selector: 'app-profile-setting',
  templateUrl: './profile-setting.component.html',
  styleUrls: ['./profile-setting.component.css']
})
export class ProfileSettingComponent implements OnInit {

  currentUser$ : Observable<ApplicationUser>
  currentUser : ApplicationUser = null
  profileForm: FormGroup
  bio : FormControl

  constructor(
    private accountService : AccountService, 
    private router : Router,
    private formBuilder : FormBuilder,
    private notif : NotificationService      
  ) {}

  async ngOnInit(): Promise<void> {
    if(!this.accountService.checkLoginStatus())
      this.router.navigate(['/login'], {queryParams: {returnUrl : this.router.url}})

    await this.accountService.currentUser.then((x) => this.currentUser$ = x)
    this.currentUser$.subscribe(x => this.currentUser = x)

    // Make Form Control
    this.bio = new FormControl(this.currentUser.bio)

    // Initialize FormGroup using FormBuilder
    this.profileForm = this.formBuilder.group({
      bio : this.bio
    })
  }

  public useFileInput() {
    document.getElementById('fileInput').click();
  }
  
  // Add FormControl to FormGroup for file input
  public fileEvent($event) {
    // Get Target File
    let file = $event.target.files[0]

    // Upload File Or Replace If Already Exist
    this.accountService.uploadProfileImage(file, this.currentUser.id).subscribe(
      result => {
        console.log(result)
        let index = this.currentUser.blobFiles.findIndex(x => x.blobFileID == result.blobFileID)
        if(index > -1)
          this.currentUser.blobFiles[index] = result
        else
          this.currentUser.blobFiles.push(result)  
      }, error => {
        console.log(error)
      }
    )
  }

  get profileImage(){
    if(this.currentUser.blobFiles.length != 0)
    {
      var blobFile = this.currentUser.blobFiles.find(x => x.container == 'profile')
      if(blobFile != null) { return blobFile.uri + "?" + blobFile.lastModified }
    }  
    return "../../assets/img/default-profile.png"
  }

  clearProfile(){
    let imageFileID = this.currentUser.blobFiles.find(x => x.container == 'profile').blobFileID
    if(imageFileID != undefined){
      this.accountService.deleteProfileImage(imageFileID).subscribe(
        result => {
          // Remove Item From Project File
          let index = this.currentUser.blobFiles.indexOf(result,0)
          this.currentUser.blobFiles.splice(index, 1);
          console.log(result)
        },error => {
          console.log(error)
        }
      )
    }
  }

  onSubmit(){
    let form = this.profileForm.value

    this.accountService.updateUser(form.bio, this.currentUser.id).subscribe(
      result => {
        this.currentUser = result
        this.notif.showSuccess("Account has been sucessfully updated","Account Update")
      }, error =>{
        console.log(error)
      }
    )
  }

}
