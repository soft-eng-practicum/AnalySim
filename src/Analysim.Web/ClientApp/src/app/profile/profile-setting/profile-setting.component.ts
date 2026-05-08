import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, FormBuilder } from '@angular/forms';
import { AccountService } from 'src/app/services/account.service';
import { Router } from '@angular/router';
import { User } from 'src/app/interfaces/user';
import { from, Observable } from 'rxjs';
import { NotificationService } from 'src/app/services/notification.service';
import { ProjectService } from 'src/app/services/project.service';
import { SafeUrl, DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-profile-setting',
  templateUrl: './profile-setting.component.html',
  styleUrls: ['./profile-setting.component.scss']
})
export class ProfileSettingComponent implements OnInit {
  currentUser$: Observable<User>;
  currentUser: User = null;

  profileImageUrl: SafeUrl;

  constructor(
    private accountService: AccountService,
    private projectService: ProjectService,
    private router: Router,
    private formBuilder: FormBuilder,
    private sanitizer: DomSanitizer,
    private notif: NotificationService,
  ) { }

  async ngOnInit(): Promise<void> {
    if (!this.accountService.checkLoginStatus())
      this.router.navigate(['/login'], {
        queryParams: { returnUrl: this.router.url },
      });

    await this.accountService.currentUser.then((x) => (this.currentUser$ = x));
    this.currentUser$.subscribe((x) => {
      this.currentUser = x;

      this.getProfileImage();
      this.buildProfileBioForm();
      this.buildNotificationsPrefForm();
    });
  }

  public useFileInput() {
    document.getElementById('fileInput').click();
  }

  // Add FormControl to FormGroup for file input
  public fileEvent($event) {
    // Get Target File
    let file = $event.target.files[0];

    // Upload File Or Replace If Already Exist
    this.accountService.uploadProfileImage(file, this.currentUser.id).subscribe(
      (result) => {
        let index = this.currentUser.blobFiles.findIndex(
          (x) => x.blobFileID == result.blobFileID,
        );
        if (index > -1) this.currentUser.blobFiles[index] = result;
        else this.currentUser.blobFiles.push(result);
        // this.profileImage();
        this.accountService.setCurrentUser(this.currentUser);
      },
      (error) => {
        console.log(error);
      },
    );
  }

  getProfileImage() {
    if (this.currentUser.blobFiles.length != 0) {
      var blobFile = this.currentUser.blobFiles.find(
        (x) => x.container == 'profile',
      );
      if (blobFile != null) {
        this.projectService.downloadFile(blobFile.blobFileID).subscribe(
          (imageBlob) => {
            if (imageBlob == null)
              this.profileImageUrl = '../../assets/img/default-profile.png';
            const objectURL = URL.createObjectURL(imageBlob);
            this.profileImageUrl =
              this.sanitizer.bypassSecurityTrustUrl(objectURL);
          },
          (error) => {
            console.log(error);
          },
        );
      } else this.profileImageUrl = '../../assets/img/default-profile.png';
    } else this.profileImageUrl = '../../assets/img/default-profile.png';
  }

  onRemoveProfileImage() {
    let imageFileID = this.currentUser.blobFiles.find(
      (x) => x.container == 'profile',
    ).blobFileID;
    if (imageFileID != undefined) {
      this.accountService.deleteProfileImage(imageFileID).subscribe(
        (result) => {
          // Remove Item From Project File
          let index = this.currentUser.blobFiles.indexOf(result, 0);
          this.currentUser.blobFiles.splice(index, 1);
          this.accountService.setCurrentUser(this.currentUser);
        },
        (error) => {
          console.log(error);
        },
      );
    }
  }

  // BIO FORM
  profileBioForm: FormGroup;
  bio: FormControl;

  buildProfileBioForm() {
    this.bio = new FormControl(this.currentUser.bio);
    this.profileBioForm = this.formBuilder.group({
      bio: this.bio,
    });
  }

  onUpdateBio() {
    let form = this.profileBioForm.value;

    this.accountService.updateUser(form.bio, this.currentUser.id).subscribe(
      (result) => {
        this.currentUser = result;
        this.notif.showSuccess(
          'Account has been successfully updated',
          'Account Update',
        );
      },
      (error) => {
        console.log(error);
      },
    );
  }

  // EMAIL FORM
  emailForm: FormGroup;
  onChangeEmail() {
    // will need to revalidate email
  }

  // PASSWORD FORM
  passwordForm: FormGroup;
  onChangePassword() {
    // call to change password
  }

  // NOTIFICATION FORM
  notificationForm: FormGroup;
  sendCommentNotifications: FormControl;

  buildNotificationsPrefForm() {
    this.sendCommentNotifications = new FormControl(
      this.currentUser.receiveCommentReplyEmails,
    );
    this.notificationForm = this.formBuilder.group({
      sendCommentNotifications: this.sendCommentNotifications,
    });
  }

  onSaveNotificationPreferences() {
    let form = this.notificationForm.value;

    this.accountService.updateNotificationPreferences(form.sendCommentNotifications, this.currentUser.id).subscribe(
      (result) => {
        this.currentUser = result;
        this.notif.showSuccess(
          'Notification Preferences successfully updated',
          'Account Update',
        );
      },
      (error) => {
        console.log(error);
        this.notif.showMessage(
          'Notification Preferences failed to update',
          'Account Update',
        );
      },
    );
  }
}
