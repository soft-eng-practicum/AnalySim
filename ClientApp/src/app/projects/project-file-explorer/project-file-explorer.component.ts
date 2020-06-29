import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { ProjectService } from '../../services/project.service';
import { Project } from '../../interfaces/project';
import { BlobFileItem } from '../../interfaces/blob-file-item';
import { ActivatedRoute } from '@angular/router';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { NotificationService } from 'src/app/services/notification.service';
import { AccountService } from 'src/app/services/account.service';
import { Observable } from 'rxjs';
import { ApplicationUser } from 'src/app/interfaces/user';
import { BlobFile } from 'src/app/interfaces/blob-file';
import { UploadFileItem } from 'src/app/interfaces/upload-file-item';

@Component({
  selector: 'app-project-file-explorer',
  templateUrl: './project-file-explorer.component.html',
  styleUrls: ['./project-file-explorer.component.css']
})
export class ProjectFileExplorerComponent implements OnInit {

  constructor(
    private projectService : ProjectService,
    private accountService : AccountService,
    private route: ActivatedRoute, 
    private modalService : BsModalService, 
    private notfi : NotificationService) { }

  @ViewChild('uploadModal') uploadFileModal : TemplateRef<any>;
  @ViewChild('folderModal') folderModal : TemplateRef<any>;
  uploadModalRef : BsModalRef;
  folderModalRef : BsModalRef;

  currentUser$ : Observable<ApplicationUser> = null

  project : Project = null
  blobFileItemList : BlobFileItem[]
  currentDirectory : string = null
  validDirectory : boolean = true
  selectedItem : number = null

  uploadInProgress : boolean = false
  uploadFileList : UploadFileItem[] = []

  async ngOnInit() {
    if(this.accountService.checkLoginStatus()){
      await this.accountService.currentUser.then((x) => this.currentUser$ = x)
    }

    // Set Directory Param When First Load
    this.route.url.subscribe(segments =>{
      // If No Param, then default to single slash
      if(segments.length == 0){
        this.currentDirectory = ""
      }
      // Join Param By Slash To Create Directory Path
      else{
        this.currentDirectory = segments.join("/") + "/"
      }
    });

    // Set Project
    this.projectService.getProjectByID(1).subscribe(
      result =>{
        this.project = result
        this.setDirectoryFile(this.currentDirectory)
      }
    )
    console.log(this.currentDirectory)
  }


  public fileEvent($event) {
    for (let file of $event.target.files)
    {
      // Check If Name Already Exist
      if((this.blobFileItemList.findIndex(x => x.name == file.name)) == -1)
      {
        // Add File To Upload List
        var fileItem : UploadFileItem = {
          file: file,
          directory: this.currentDirectory,
          projectID: 1,
          uploadStatus: "loading"
        }
        this.uploadFileList.push(fileItem)
      }    
    }
    
    if(this.uploadFileList.length == 0){
      // Show Warning If No Unique Name
      this.notfi.showWarning("File Name Already Exist", "Upload Error")
    }
    else{
      // Show Upload Modal
      this.toggleModalUpload()
    }
  }

  toggleModalUpload(){
    this.uploadModalRef = this.modalService.show(this.uploadFileModal)
  }

  toggleModalFolder(){
    this.folderModalRef = this.modalService.show(this.folderModal)
  }

  updateFileList(uploadFileList : UploadFileItem[]){
    this.uploadFileList = uploadFileList;
  }

  addNewFile(blobFile : BlobFile){
    this.project.blobFiles.push(blobFile)
    this.setDirectoryFile(this.currentDirectory)
  }

  setSelectedItem(itemNum : number){
    this.selectedItem = itemNum
  }

  setDirectoryFile(directory : string){
    // Set Current Directory
    this.currentDirectory = directory

    
    if(!this.project.blobFiles.find(x => x.directory == directory)){
      // Return Nothing If No Valid Path
      this.blobFileItemList = []
      this.validDirectory = false;
    } 
    else{

      let fileItemList : BlobFileItem[] = [];

      // Input Directory Num
      var currentDirectoryNum = directory.split("/").length-1;

      // Check If File 
      this.project.blobFiles.forEach(file => 
      {

        // Get Full Path Of File
        let fullName = file.directory + file.name + file.extension


        // File Directory Num
        var fileDirectoryNum = fullName.split("/").length-1

        // Total Directory Num
        var totalDirectoryNum = fileDirectoryNum - currentDirectoryNum

        // Check Match Starting Directory
        if (fullName.startsWith(directory)){
          switch (totalDirectoryNum){
            // Match Current Directory File
            case 0:
              var fileItem : BlobFileItem = {
                type: "file",
                name: file.name + file.extension,
                file: file,
                redirect: null,
                order: null
              }
              fileItemList.push(fileItem)
              break;
            // Match Next Folder Directory
            case 1:
              let newDirectory = file.directory.replace(directory, "")
              var fileItem : BlobFileItem = {
                type: "folder",
                name: newDirectory.substring(0, newDirectory.lastIndexOf("/")),
                file: null,
                redirect: file.directory,
                order: null
              }
              fileItemList.push(fileItem)
              break;
          }
        }
      })

      // If One Slash, Redirect to Root
      if(currentDirectoryNum == 1){
        var fileItem : BlobFileItem = {
          type: "none",
          name: ". . .",
          file: null,
          redirect: "",
          order: null
        }
        fileItemList.push(fileItem)
      }
      // If More Then One Slash, Redirect to Previous Directory
      else if(currentDirectoryNum > 1){
        var fileItem : BlobFileItem = {
          type: "none",
          name: ". . .",
          file: null,
          redirect: directory.substring(0 , directory.substring(0, directory.lastIndexOf("/")).lastIndexOf("/") + 1),
          order: null
        }
        fileItemList.push(fileItem)
      }

      // Remove Duplicate
      fileItemList = fileItemList.filter((item, index) => { return fileItemList.findIndex(file => file.name == item.name) == index })

      // Sort By Name
      fileItemList.sort((a,b) => (a.name > b.name) ? 1 : -1)

      // Sort By Type
      fileItemList.sort((a,b) => (a.type < b.type) ? 1 : -1)

      // Remove Placeholder File
      fileItemList = fileItemList.filter(x => x.name != "$$$.$$")

      // Set Order Number
      fileItemList.map((item, index) => item.order = index)

      console.log(fileItemList)

      // Set File List
      this.blobFileItemList = fileItemList

      this.validDirectory = true;
    }
  }

}
