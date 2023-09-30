import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Router } from '@angular/router';
import { map, catchError } from 'rxjs/operators';
import { Observable, empty, throwError } from 'rxjs';
import { Project } from '../interfaces/project';
import { AccountService } from './account.service';
import { ProjectUser } from '../interfaces/project-user';
import { BlobFile } from '../interfaces/blob-file';
import { Tag } from '../interfaces/tag';
import { ProjectTag } from '../interfaces/project-tag';
import { User } from '../interfaces/user';
import { NotificationService } from './notification.service';
import { saveAs } from 'file-saver';
import { Notebook, NotebookFile, NotebookURL } from '../interfaces/notebook';

@Injectable({
  providedIn: 'root'
})
export class ProjectService {

  constructor(
    private http: HttpClient,
    private router: Router,
    private accountService: AccountService,
    private notfi: NotificationService) { }

  // Url to access Web API
  private baseUrl: string = '/api/project/'

  // Get
  private urlGetProjectByID: string = this.baseUrl + "getprojectbyid/"
  private urlGetProjectByRoute: string = this.baseUrl + "getprojectbyroute/"
  private urlGetProjectRange: string = this.baseUrl + "getprojectrange?"
  private urlGetProjectList: string = this.baseUrl + "getprojectList"
  private urlSearch: string = this.baseUrl + "search/"
  private urlDownloadFile: string = this.baseUrl + "downloadFile/"
  private urlDownloadNotebook: string = this.baseUrl +"DownloadNotebook/"


  // Post
  private urlCreateProject: string = this.baseUrl + "createproject"
  private urlAddUser: string = this.baseUrl + "adduser"
  private urlAddTag: string = this.baseUrl + "addtag"
  private urlUploadFile: string = this.baseUrl + "uploadfile"
  private urlCreateFolder: string = this.baseUrl + "createFolder"
  private urlCreateNotebookFolder: string = this.baseUrl + "createNotebookFolder"
  private urlForkProject: string = this.baseUrl + "forkproject"
  private urlForkProjectWithoutBlob: string = this.baseUrl + "forkprojectwithoutblob"

  // Put
  private urlUpdateProject: string = this.baseUrl + "updateproject/"
  private urlupdateUser: string = this.baseUrl + "updateuser"
  private urlUpdateFile: string = this.baseUrl + "updateFile"
  private urlRenameNotebook : string = this.baseUrl+"RenameNotebook"

  // Delete
  private urlDeleteProject: string = this.baseUrl + "deleteproject/"
  private urlRemoveUser: string = this.baseUrl + "removeuser/"
  private urlRemoveTag: string = this.baseUrl + "removetag/"
  private urlDeleteFile: string = this.baseUrl + "deleteFile/"

  // Extra
  private urlGetUserList: string = this.baseUrl + "getuserlist/"
  private urlGetFileList: string = this.baseUrl + "getfilelist/"
  private urlGetNotebookList: string = this.baseUrl + "getNotebooks/";
  private urlGetNotebook: string = this.baseUrl+"GetNotebook/";
  private urlGetTagList: string = this.baseUrl + "gettaglist/"

  private urlUploadNotebook: string = this.baseUrl + "uploadnotebook";
  private urlUploadExistingNotebook: string = this.baseUrl + "uploadexistingnotebook";
  private urlDeleteNotebook: string = this.baseUrl + "deleteNotebook/";
  private urlGetShareableLink : string = this.baseUrl + "GetShareableLinkofFile/";


  getProjectByID(projectID: number): Observable<Project> {
    return this.http.get<any>(this.urlGetProjectByID + projectID)
      .pipe(
        map(body => {
          console.log(body.message)
          return body.result
        }),
        catchError(error => {
          console.log(error)
          return throwError(error)
        })
      )
  }

  getProjectByRoute(owner: string, projectName: string): Observable<Project> {
    return this.http.get<any>(this.urlGetProjectByRoute + owner + "/" + projectName)
      .pipe(
        map(body => {
          console.log(body.message)
          return body.result
        }),
        catchError(error => {
          console.log(error)
          return throwError(error)
        })
      )
  }

  getProjectRange(ids: number[]): Observable<Project[]> {
    let params = new HttpParams()
    ids.forEach(x => params = params.append("id", x.toString()))

    return this.http.get<any>(this.urlGetProjectRange, { params: params })
      .pipe(
        map(body => {
          console.log(body.message)
          return body.result
        }),
        catchError(error => {
          console.log(error)
          return throwError(error)
        })
      )
  }

  getProjectList(): Observable<Project[]> {
    return this.http.get<any>(this.urlGetProjectList)
      .pipe(
        map(body => {
          console.log(body.message)
          return body.result
        }),
        catchError(error => {
          console.log(error)
          return throwError(error)
        })
      )
  }

  search(searchTerms: string[]): Observable<Project[]> {
    let params = new HttpParams()
    searchTerms.forEach(function (x) {
      params = params.append("term", x)
    })

    return this.http.get<any>(this.urlSearch, { params: params })
      .pipe(
        map(body => {
          if (!body) return []
          console.log(body.message)
          return body.result
        }),
        catchError(error => {
          console.log(error)
          return throwError(error)
        })
      )
  }

  downloadFile(blobFileID: number) {
    return this.http.get(this.urlDownloadFile + blobFileID, { responseType: "blob" }).pipe(
      map(body => {
        if (body.type != 'text/plain') {
          return new Blob([body])
        }
        else {
          alert('File not found in Blob!');
          return null
        }
      }),
      catchError(error => {
        console.log(error)
        return throwError(error)
      })
    )
  }

  downloadNotebook(notebook: Notebook) {
    return this.http.get(this.urlDownloadNotebook + notebook.notebookID, { responseType: "blob" }).pipe(
      map(body => {
        if (body.type != 'text/plain') {
          return new Blob([body])
        }
        else {
          alert('File not found in Blob!');
          return null
        }
      }),
      catchError(error => {
        console.log(error)
        return throwError(error)
      })
    )
  }

  createProject(currentUser: User, projectName: string, visibility: string, description: string): Observable<Project> {
    let body = new FormData()
    body.append('name', projectName)
    body.append('visibility', visibility)
    body.append('description', description)
    body.append('userid', currentUser.id.toString())
    body.append('route', currentUser.userName + "/" + projectName)

    return this.http.post<any>(this.urlCreateProject, body)
      .pipe(
        map(body => {
          console.log(body.message)
          return body.result
        }),
        catchError(error => {
          console.log(error)
          return throwError(error)
        })
      )
  }

  forkProject(userID: number, projectID: number, blobFilesID: number[]): Observable<Project> {
    let body = new FormData()
    body.append('userID', userID.toString())
    body.append('projectID', projectID.toString())
    for (let i = 0; i < blobFilesID.length; i++) {
      body.append('BlobFilesID', blobFilesID[i].toString())
    }
    body.getAll('BlobFilesID')

    return this.http.post<any>(this.urlForkProject, body)
      .pipe(
        map(body => {
          console.log(body.message)
          return body.result
        }),
        catchError(error => {
          console.log(error)
          return throwError(error)
        })
      )
  }

  forkProjectWithoutBlob(userID: number, projectID: number): Observable<Project> {
    let body = new FormData()
    body.append('userID', userID.toString())
    body.append('projectID', projectID.toString())

    return this.http.post<any>(this.urlForkProjectWithoutBlob, body)
      .pipe(
        map(body => {
          console.log(body.message)
          return body.result
        }),
        catchError(error => {
          console.log(error)
          return throwError(error)
        })
      )
  }



  addUser(projectID: number, userID: number, userRole: string, isFollowing: boolean): Observable<ProjectUser> {
    let body = new FormData()
    body.append('projectid', projectID.toString())
    body.append('userid', userID.toString())
    body.append('userrole', userRole)
    body.append('isFollowing', isFollowing ? 'true' : 'false')

    return this.http.post<any>(this.urlAddUser, body)
      .pipe(
        map(body => {
          console.log(body.message)
          return body.result
        }),
        catchError(error => {
          console.log(error)
          return throwError(error)
        })
      )
  }

  addTag(projectID: number, tagName: string): Observable<ProjectTag> {
    let body = new FormData()
    body.append('projectid', projectID.toString())
    body.append('tagname', tagName.toString())

    return this.http.post<any>(this.urlAddTag, body)
      .pipe(
        map(body => {
          console.log(body.message)
          return body.result
        }),
        catchError(error => {
          console.log(error)
          return throwError(error)
        })
      )
  }

  uploadFile(file: any, directory: string, userID: number, projectID: number): Observable<BlobFile> {
    let body = new FormData()
    body.append('file', file)
    body.append('directory', directory)
    body.append('userID', userID.toString())
    body.append('projectID', projectID.toString())
    
    return this.http.post<any>(this.urlUploadFile, body).pipe(
      map(body => {
        console.log(body.result)
        return body.result
      }),
      catchError(error => {
        console.log(error)
        return throwError(error)
      })
    );
  }

  uploadNotebook(notebook: NotebookFile,directory: string) {
    let body = new FormData();
    body.append('NotebookFile', notebook.file);
    body.append('NotebookName',notebook.name);
    body.append('ProjectID', notebook.projectID.toString());
    body.append('directory', directory);

    return this.http.post<any>(this.urlUploadNotebook, body).pipe(
      map(body => {
        console.log(body.result)
        return body.result
      }),
      catchError(error => {
        console.log(error)
        return throwError(error)
      })
    );
  }

  uploadExistingNotebook(notebookURL: NotebookURL, directory: string) {
    let body = new FormData();
    body.append('NotebookURL', notebookURL.url);
    body.append('NotebookName', notebookURL.name);
    body.append('ProjectID', notebookURL.projectID.toString());
    body.append('Type', notebookURL.type);
    body.append('observableNotebookDatasets',JSON.stringify(notebookURL.datasets));
    body.append('directory', directory);

    return this.http.post<any>(this.urlUploadExistingNotebook, body).pipe(
      map(body => {
        console.log(body.result)
        return body.result
      }),
      catchError(error => {
        console.log(error)
        return throwError(error)
      })
    );
  }

  createFolder(directory: string, userID: number, projectID: number): Observable<BlobFile> {
    let body = new FormData()
    body.append('directory', directory)
    body.append('userID', userID.toString())
    body.append('projectID', projectID.toString())

    return this.http.post<any>(this.urlCreateFolder, body).pipe(
      map(body => {
        console.log(body.message)
        return body.result
      }),
      catchError(error => {
        console.log(error)
        return throwError(error)
      })
    );
  }

  createNotebookFolder(directory: string, folderName: string, projectID: number): Observable<Notebook> {
    let body = new FormData()
    body.append('directory', directory);
    body.append('folderName', folderName);
    body.append('projectID', projectID.toString());

    return this.http.post<any>(this.urlCreateNotebookFolder, body).pipe(
      map(body => {
        console.log(body.message)
        return body.result
      }),
      catchError(error => {
        console.log(error)
        return throwError(error)
      })
    );
  }

  //Service to update a file name
  updateFile(directory: string, userID: number, projectID: number): Observable<BlobFile> {

    let body = new FormData()
    body.append('directory', directory)
    body.append('userID', userID.toString())
    body.append('projectID', projectID.toString())

    return this.http.put<any>(this.urlUpdateFile, body)
      .pipe(
        map(body => {
          console.log(body.message)
          return body.result
        }),
        catchError(error => {
          console.log(error)
          return throwError(error)
        })
      )
  }

  updateProject(updateProject: Project): Observable<Project> {
    let body = new FormData()
    body.append('name', updateProject.name)
    body.append('visibility', updateProject.visibility)
    body.append('description', updateProject.description)

    return this.http.put<any>(this.urlUpdateProject + updateProject.projectID, body)
      .pipe(
        map(body => {
          console.log(body.message)
          return body.result
        }),
        catchError(error => {
          console.log(error)
          return throwError(error)
        })
      )
  }

  updateUser(userRole: ProjectUser): Observable<ProjectUser> {
    let body = new FormData()
    body.append('userid', userRole.userID.toString())
    body.append('projectid', userRole.projectID.toString())
    body.append('userrole', userRole.userRole)
    body.append('isFollowing', userRole.isFollowing ? 'true' : 'false')


    return this.http.put<any>(this.urlupdateUser, body)
      .pipe(
        map(body => {
          console.log(body.message)
          return body.result
        }),
        catchError(error => {
          console.log(error)
          return throwError(error)
        })
      )
  }

  deleteProject(projectID: number): Observable<Project> {
    return this.http.delete<any>(this.urlDeleteProject + projectID)
      .pipe(
        map(body => {
          console.log(body.message)
          return body.result
        }),
        catchError(error => {
          console.log(error)
          return throwError(error)
        })
      )
  }

  removeUser(projectID: number, userID: number): Observable<ProjectUser> {

    return this.http.delete<any>(this.urlRemoveUser + projectID + '/' + userID)
      .pipe(
        map(body => {
          console.log(body.message)
          return body.result
        }),
        catchError(error => {
          console.log(error)
          return throwError(error)
        })
      )
  }

  removeTag(projectID: number, tagID: number): Observable<ProjectTag> {

    return this.http.delete<any>(this.urlRemoveTag + projectID + '/' + tagID)
      .pipe(
        map(body => {
          console.log(body.message)
          return body.result
        }),
        catchError(error => {
          console.log(error)
          return throwError(error)
        })
      )
  }

  deleteFile(blobFileID: number,isMember : boolean): Observable<BlobFile> {
    return this.http.delete<any>(this.urlDeleteFile + blobFileID+'/'+isMember).pipe(
      map(body => {
        console.log(body.message)
        return body.result
      }),
      catchError(error => {
        console.log(error)
        return throwError(error)
      })
    );
  }

  deleteNotebook(notebookID: number,isMember : boolean): Observable<Notebook> {
    return this.http.delete<any>(this.urlDeleteNotebook + notebookID+'/'+isMember).pipe(
      map(body => {
        console.log(body.message)
        return body.result
      }),
      catchError(error => {
        console.log(error)
        return throwError(error)
      })
    );
  }

  // Extra
  getUserList(projectID: number): Observable<ProjectUser[]> {

    return this.http.get<any>(this.urlGetUserList + projectID)
      .pipe(
        map(body => {
          console.log(body.message)
          return body.result
        }),
        catchError(error => {
          console.log(error)
          return throwError(error)
        })
      )
  }



  getFileList(projectID: number): Observable<BlobFile[]> {

    return this.http.get<any>(this.urlGetFileList + projectID)
      .pipe(
        map(body => {
          console.log(body.message)
          return body.result
        }),
        catchError(error => {
          console.log(error)
          return throwError(error)
        })
      )
  }

  getNotebooks(projectID: number, directory: string): Observable<Notebook[]> {
    return this.http.get<any>(this.urlGetNotebookList + projectID + "/" + directory)
      .pipe(
        map(body => {
          console.log(body)
          return body.result
        }),
        catchError(error => {
          console.log(error)
          return throwError(error)
        })
      )
  }

  getNotebook(notebookID: number){
    return this.http.get<any>(this.urlGetNotebook+notebookID) 
    .pipe(
      map(body => {
        console.log(body.message)
        return body.notebook
      }),
      catchError(error => {
        console.log(error)
        return throwError(error)
      })
    )
  }

  getTagList(projectID: number): Observable<Tag[]> {

    return this.http.get<any>(this.urlGetTagList + projectID)
      .pipe(
        map(body => {
          console.log(body.message)
          return body.result
        }),
        catchError(error => {
          console.log(error)
          return throwError(error)
        })
      )
  }

  getShareableLink(fileID: number): Observable<string> {
    return this.http.get<any>(this.urlGetShareableLink+fileID)
    .pipe(
      map(body => {
        console.log(body.message)
        return body.result
      }),
      catchError(error => {
        console.log(error)
        return throwError(error)
      })
    )
  }

  renameNotebook(notebookID: number,newName: string) : Observable<Notebook>{
    let body = new FormData()
    body.append('NotebookID',notebookID.toString());
    body.append('NotebookName', newName)
    return this.http.put<any>(this.urlRenameNotebook,body)
    .pipe(
      map(body => {
        console.log(body.message)
        return body.notebook
      }),
      catchError(error => {
        console.log(error)
        return throwError(error)
      })
    )
  }


}
