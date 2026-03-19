import { Component, OnInit, ViewChild, TemplateRef, Input, Renderer2, ElementRef } from '@angular/core';
import { ProjectService } from '../../services/project.service';
import { Project } from '../../interfaces/project';
import { BlobFileItem } from '../../interfaces/blob-file-item';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { saveAs } from 'file-saver';
import { NotificationService } from '../../services/notification.service';
import { User } from '../../interfaces/user';
import { BlobFile } from '../../interfaces/blob-file';
import { UploadFileItem } from '../../interfaces/upload-file-item';
import { NavigationEnd, Router } from '@angular/router';
import * as d3 from 'd3';

@Component({
  selector: 'app-project-file-explorer',
  templateUrl: './project-file-explorer.component.html',
  styleUrls: ['./project-file-explorer.component.scss']
})
export class ProjectFileExplorerComponent implements OnInit {

  constructor(
    private projectService: ProjectService,
    private modalService: BsModalService,
    private notfi: NotificationService,
    private router: Router,
    private _renderer2: Renderer2) { }

  @ViewChild('uploadModal') uploadFileModal: TemplateRef<any>;
  @ViewChild('folderModal') folderModal: TemplateRef<any>;
  @ViewChild('renameModal') renameModal: TemplateRef<any>;
  @ViewChild('closeDeleteModalbutton') closeDeleteModalbutton;

  @ViewChild('observablehqPanel', { read: ElementRef }) observablehqPanel; // ISsue here

  uploadModalRef: BsModalRef;
  folderModalRef: BsModalRef;
  renameModalRef: BsModalRef;

  @Input() project: Project
  @Input() currentUser: User
  @Input() currentDirectory: string
  @Input() isMember: boolean

  blobFileItemList: BlobFileItem[] = []
  validDirectory: boolean = true;
  selectedItem: number = null;
  filePreview: boolean = false;

  uploadInProgress: boolean = false;
  uploadFileList: UploadFileItem[] = [];

  fileType: string = "";
  dataBrowserURL: string = "";
  main = null;
  csvFile: any;
  folders: string = "";

  // Search/Filter properties
  searchQuery: string = "";
  searchDebounceTimer: any;

  async ngOnInit() {
    this.dataBrowserURL = 'https://observablehq.com/embed/@sfsu/untitled?cell=*&dataset=';
    const raw = this.extractDirectory(this.router.url);
    this.currentDirectory = this.normalizeFileRoute(raw);
    this.setDirectoryFile(this.currentDirectory);
    let directory = this.currentDirectory.endsWith('.csv') ? this.currentDirectory.split('/').slice(0, -1).join('/') : this.currentDirectory;
    directory = directory.endsWith('/') ? directory.slice(0,-1) : directory;
    this.folders = "/ " + directory.split("/").join(" / ");
    this.router.events.subscribe((ev) => {
      if (ev instanceof NavigationEnd) {
        this.currentDirectory = this.normalizeFileRoute(this.extractDirectory(this.router.url));
        this.setDirectoryFile(this.currentDirectory)
        directory = this.currentDirectory.endsWith('.csv') ? this.currentDirectory.split('/').slice(0, -1).join('/') : this.currentDirectory;
        directory = directory.endsWith('/') ? directory.slice(0,-1) : directory;
      }
      this.folders = "/ " + directory.split("/").join(" / ");
      // console.log(this.folders);
    });
  }

  ngAfterViewInit() {
    let script = this._renderer2.createElement('script');
    script.type = `module`;
    script.text = this.generateScript;
    this._renderer2.appendChild(this.observablehqPanel.nativeElement, script); // issue here
  }

  extractDirectory(url) {
    let route = url.split("/").slice(4).join('/');
    if (route === "") {
      return route;
    }
    return route + '/';
  }

  normalizeFileRoute(route: string): string {
    let r = route || "";

    // remove trailing slash for parsing
    const hadTrailing = r.endsWith("/");
    if (hadTrailing) r = r.slice(0, -1);

    // split into segments
    const parts = r.split("/").filter(Boolean);

    // if first segment is "file", drop it
    if (parts[0] === "file") parts.shift();

    // rebuild
    let rebuilt = parts.join("/");
    if (rebuilt.length > 0) rebuilt += "/";
    return rebuilt;
  }

  /**
   * Get filtered list of files based on search query (case-insensitive)
   */
  get filteredBlobFileItemList(): BlobFileItem[] {
    if (!this.searchQuery.trim()) {
      return this.blobFileItemList;
    }

    const query = this.searchQuery.toLowerCase();
    return this.blobFileItemList.filter(item => 
      item.name.toLowerCase().includes(query)
    );
  }

  /**
   * Handle search input with debounce to avoid excessive re-renders
   */
  onSearchChange(event: any): void {
    const value = event.target.value;
    
    // Clear existing debounce timer
    if (this.searchDebounceTimer) {
      clearTimeout(this.searchDebounceTimer);
    }

    // Set new debounce timer (300ms delay for optimal UX)
    this.searchDebounceTimer = setTimeout(() => {
      this.searchQuery = value;
    }, 300);
  }

  /**
   * Clear search query and reset focus to search input
   */
  clearSearch(): void {
    this.searchQuery = "";
    
    // Reset focus to search input for keyboard navigation
    const searchInput = document.querySelector('.file-explorer-card__search-input') as HTMLInputElement;
    if (searchInput) {
      searchInput.value = "";
      searchInput.focus();
    }
  }

  /**
   * Handle keyboard shortcuts in search input
   * Escape: clear search, Enter: focus first result, ArrowDown: focus first item
   */
  onSearchKeydown(event: KeyboardEvent): void {
    switch (event.key) {
      case 'Escape':
        this.clearSearch();
        break;
      case 'ArrowDown':
        event.preventDefault();
        const firstItem = document.querySelector('.file-item') as HTMLElement;
        if (firstItem) {
          firstItem.focus();
        }
        break;
    }
  }


  public fileEvent($event) {
    for (let file of $event.target.files) {
      // Check If Name Already Exist
      if ((this.blobFileItemList.findIndex(x => x.name == file.name)) == -1) {
        // Add File To Upload List
        var fileItem: UploadFileItem = {
          file: file,
          directory: this.currentDirectory,
          projectID: this.project.projectID,
          uploadStatus: "loading",
          uploadMessage: ""
        }
        this.uploadFileList.push(fileItem)
      }
    }

    if (this.uploadFileList.length == 0) {
      // Show Warning If No Unique Name
      this.notfi.showWarning("File Name Already Exist", "Upload Error")
    }
    else {
      // Show Upload Modal
      this.toggleModalUpload()
    }
  }

  toggleModalRename() {
    // Show Rename Modal
    if (this.isValidDirectory) {
      this.renameModalRef = this.modalService.show(this.renameModal)
    }

  }
  toggleModalUpload() {
    // Show Upload Modal
    if (this.isValidDirectory) {
      this.uploadModalRef = this.modalService.show(this.uploadFileModal)
    }
  }

  toggleModalFolder() {
    // Show Folder Modal
    if (this.isValidDirectory) {
      this.folderModalRef = this.modalService.show(this.folderModal)
    }
  }

  get isValidDirectory() {
    return !this.blobFileItemList.some(x => x.name == "Invalid Directory" || x.name == "Invalid File")
  }

  displayUsers() {

    var projectmembers = []
    var myObj = this.project.projectUsers;
    (myObj).forEach(element => {
      projectmembers.push("User " + element.userID + ". ")

    });
    alert(projectmembers)
  }

  edit() {
    if (this.selectedItem != null) {

      var item = this.blobFileItemList[this.selectedItem] //get selected item
      this.selectedItem = null;

      // check if item type is folder
      if (item.type == "folder") {

        this.toggleModalRename() //file model pops up and user can enter folder name
      }


    }
  }



  delete() {
    // console.log("the project is : ", this.project);

    if (this.selectedItem != null) {
      // Get Selected Item
      var item = this.blobFileItemList[this.selectedItem]

      // Unselect The Current Item
      this.selectedItem = null
      // console.log("the selected file is : ", item)

      // Delete Item If File
      if (item.type == "file") {

        // Delete The Item
        this.projectService.deleteFile(item.file.blobFileID, this.isMember).subscribe(res => {
          console.log(res);

          // Remove Item From Project File
          let index = this.project.blobFiles.indexOf(item.file, 0)
          if (index > -1 && this.project.blobFiles.length > 1) {
            this.project.blobFiles.splice(index, 1);
          }
          else if (index > -1 && this.project.blobFiles.length == 1) {
            this.project.blobFiles = []
          }

          // Refresh The Page
          this.setDirectoryFile(this.currentDirectory)
          this.closeDeleteModalbutton.nativeElement.click();
          this.router.navigate(["project/" + this.project.route])
        })
      }
      else if (item.type == "folder") {
        //checking if the folder is empty
        let filesInsideFolder = this.project.blobFiles.filter(x => {
          return (
            x.directory.startsWith(item.redirect) &&
            (x.directory != item.redirect || x.extension != ".$$")
          )
        })
        if (filesInsideFolder.length > 0) {
          this.notfi.showWarning("Folder is not empty", "Delete Error")
          this.closeDeleteModalbutton.nativeElement.click();
          return
        }
        // Remove Item From Project File
        let index = this.project.blobFiles.findIndex(x => x.directory == item.redirect)
        let blobFileId = this.project.blobFiles[index].blobFileID
        if (index > -1) {
          this.project.blobFiles.splice(index, 1);
        }

        // Refresh The Page
        this.setDirectoryFile(this.currentDirectory)

        // Delete The Item
        this.projectService.deleteFile(blobFileId, this.isMember).subscribe(res => {
          console.log(res);
          this.closeDeleteModalbutton.nativeElement.click();
        })
      }
    }

  }

  saveFile() {
    if (this.selectedItem != null) {
      // Get Current Selected Item
      var item = this.blobFileItemList[this.selectedItem]
      if (item.type == "file") {
        // Download The File
        var fileName = item.file.name + item.file.extension
        this.projectService.downloadFile(item.file.blobFileID).subscribe(
          result => {
            const url = URL.createObjectURL(result);
            const a = document.createElement('a');
            a.href = url;
            a.download = fileName;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
          }, error => {
            console.log(error)
          }
        )
      }
    }

    // if (this.selectedItem != null) {
    //   // Get Current Selected Item
    //   var item = this.blobFileItemList[this.selectedItem]
    //   window.open(item.file.uri, "_blank");
    // }

  }

  updateFileList(uploadFileList: UploadFileItem[]) {
    this.uploadFileList = uploadFileList;
  }

  addNewFile(blobFile: BlobFile) {
    // Push File To Project
    this.project.blobFiles.push(blobFile)

    // Refresh the File List
    this.setDirectoryFile(this.currentDirectory)
  }

  setSelectedItem(itemNum: number) {
    this.selectedItem = itemNum
  }

  get generateScript(): String {
    return ` import {Runtime, Inspector} from "https://cdn.jsdelivr.net/npm/@observablehq/runtime@4/dist/runtime.js";
    var notebookLink = "https://api.observablehq.com/@sfsu/untitled.js?v=3";
    import(notebookLink).then((define) =>{
        var notebook = define.default;
        this.main = new Runtime().module(notebook, name =>{
            if(name==="data")
            {
            }
            return Inspector.into("#notebook")();
        });
        console.log(true);
    });`

  }

  public setDirectoryFile(directory: string) {

    // Reset Item List
    this.blobFileItemList = []

    // Set Current Directory
    this.currentDirectory = directory;

    var defaultRoute = "project/" + this.project.route

    // console.log("inside setDirectory: ", this.currentDirectory);

    this.filePreview = false

    if (this.project.blobFiles.length != 0) {
      // Check If Directory Is File
      if (!(this.currentDirectory.indexOf(".") > -1)) {
        this.fileType = "folder";
        let fileItemList: BlobFileItem[] = [];

        // Input Directory Num
        var currentDirectoryNum = directory.split("/").length - 1;

        // Check If File 
        this.project.blobFiles.forEach(file => {

          // Get Full Path Of File
          let fullName = file.directory + file.name + file.extension

          // File Directory Num
          var fileDirectoryNum = fullName.split("/").length - 1

          // Total Directory Num
          var totalDirectoryNum = fileDirectoryNum - currentDirectoryNum

          // Check Match Starting Directory
          if (fullName.startsWith(directory)) {
            switch (totalDirectoryNum) {
              // Match Current Directory File
              case 0:
                var fileItem: BlobFileItem = {
                  type: "file",
                  name: file.name + file.extension,
                  file: file,
                  defaultroute: defaultRoute + "/",
                  redirect: file.directory + file.name + file.extension,
                  order: null
                }
                fileItemList.push(fileItem)
                break;
              // Match Next Folder Directory
              case 1:
                let newDirectory = file.directory.replace(directory, "")
                var fileItem: BlobFileItem = {
                  type: "folder",
                  name: newDirectory.substring(0, newDirectory.lastIndexOf("/")),
                  file: null,
                  defaultroute: defaultRoute + "/",
                  redirect: file.directory,
                  order: null
                }
                fileItemList.push(fileItem)
                break;
            }
          }
        })

        // Invalid Directory If Nothing Matches
        if (fileItemList.length == 0) {

          // Return Nothing If No Valid Path
          this.blobFileItemList = [
            {
              type: "none",
              name: ". . .",
              file: null,
              defaultroute: defaultRoute,
              redirect: "",
              order: 0
            },
            {
              type: "none",
              name: "Invalid Directory",
              file: null,
              defaultroute: null,
              redirect: null,
              order: 1
            }
          ]
        }
        else {
          // If One Slash, Redirect to Root
          if (currentDirectoryNum == 1) {
            var fileItem: BlobFileItem = {
              type: "none",
              name: ". . .",
              file: null,
              defaultroute: defaultRoute,
              redirect: "",
              order: null
            }
            fileItemList.push(fileItem)
          }
          // If More Then One Slash, Redirect to Previous Directory
          else if (currentDirectoryNum > 1) {
            var fileItem: BlobFileItem = {
              type: "none",
              name: ". . .",
              file: null,
              defaultroute: defaultRoute + "/",
              redirect: directory.substring(0, directory.substring(0, directory.lastIndexOf("/")).lastIndexOf("/") + 1),
              order: null
            }
            fileItemList.push(fileItem)
          }
        }

        // Remove Duplicate
        fileItemList = fileItemList.filter((item, index) => { return fileItemList.findIndex(file => file.name == item.name) == index })

        // Sort By Name
        fileItemList.sort((a, b) => (a.name > b.name) ? 1 : -1)

        // Sort By Type
        fileItemList.sort((a, b) => (a.type < b.type) ? 1 : -1)

        // Remove Placeholder File
        fileItemList = fileItemList.filter(x => x.name != "$$$.$$")

        // Set Order Number
        fileItemList.map((item, index) => item.order = index)

        // Set File List
        this.blobFileItemList = fileItemList
      }
      else {
        this.fileType = "file";
        // Set File List
        let fileItemList: BlobFileItem[] = [];
        console.log(this.project);
        console.log(this.currentDirectory.length);
        this.currentDirectory = decodeURIComponent(this.currentDirectory.slice(0, this.currentDirectory.length - 1));
        console.log("current directory decoded: ", this.currentDirectory);
        var file = this.project.blobFiles.find(x => this.currentDirectory == x.directory + x.name + x.extension)
        // Check if file exist
        if (file == undefined) {
          fileItemList = [
            {
              type: "none",
              name: ". . .",
              file: null,
              defaultroute: defaultRoute,
              redirect: "",
              order: 0
            },
            {
              type: "none",
              name: "Invalid File",
              file: null,
              defaultroute: null,
              redirect: null,
              order: 1
            }
          ]
        }
        else {
          directory = this.currentDirectory;
          fileItemList.push(
            {
              type: "none",
              name: ". . .",
              file: null,
              defaultroute: defaultRoute + "/",
              redirect: directory.substring(0, directory.lastIndexOf("/") + 1),
              order: 0
            },
            {
              type: "file",
              name: file.name + file.extension,
              file: file,
              defaultroute: null,
              redirect: null,
              order: 1
            }
          )
          this.filePreview = true
          this.dataBrowserURL += file.uri;
          this.csvFile = file;
          console.log(this.dataBrowserURL);

        }

        //Set Blob File Item
        this.blobFileItemList = fileItemList
      }
    }
  }

}
