import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
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
import { getItem } from 'localforage';
import { ProjectComment } from '../interfaces/project-comment';
import { FlaggedCommentGroup } from '../interfaces/project-comment-flag';
import { ProjectLog } from '../interfaces/project-log';
import { ExpiredProjectLog } from '../interfaces/expired-project-log';
import { Publication } from '../interfaces/publication';

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
  private urlDownloadImage: string = this.baseUrl + "downloadFile/"
  private urlDownloadNotebook: string = this.baseUrl + "DownloadNotebook/"
  private urlGetNotebookVersions: string = this.baseUrl + "getnotebookversions/"
  private urlGetProjectComments: string = this.baseUrl + "getprojectcomments/";
  private urlGetFlaggedProjectComments: string = this.baseUrl + "GetAllFlaggedComments";
  private urlGetProjectLogs: string = this.baseUrl + "getprojectlogs/";
  private urlGetProjectLogComments: string = this.baseUrl + "getprojectlogcomments/";
  private urlGetExpiredProjectLogs: string = this.baseUrl + "getexpiredprojectlogs/";
  private urlGetPublications: string = this.baseUrl + "GetPublications/";

  // Post
  private urlCreateProject: string = this.baseUrl + "createproject"
  private urlAddUser: string = this.baseUrl + "adduser"
  private urlFollowProject: string = this.baseUrl + "followproject/"
  private urlUnfollowProject: string = this.baseUrl + "unfollowproject/"
  private urlAddTag: string = this.baseUrl + "addtag"
  private urlUploadFile: string = this.baseUrl + "uploadfile"
  private urlCreateFolder: string = this.baseUrl + "createFolder"
  private urlCreateNotebookFolder: string = this.baseUrl + "createNotebookFolder"
  private urlForkProject: string = this.baseUrl + "forkproject"
  private urlForkProjectWithoutBlob: string = this.baseUrl + "forkprojectwithoutblob"
  private urlAddDatasetToNotebook: string = this.baseUrl + "addDatasetToNotebook"
  private urlPostComment: string = this.baseUrl + "postcomment";
  private urlLikeComment: string = this.baseUrl + "likecomment/";
  private urlReportComment: string = this.baseUrl + "reportcomment/";
  private urlDeleteCommentandReports: string = this.baseUrl + "deletecommentandreports/";
  private urlAddProjectLog: string = this.baseUrl + "addprojectlog";
  private urlAddPublication: string = this.baseUrl + "addPublication";

  // Put
  private urlUpdateProject: string = this.baseUrl + "updateproject/"
  private urlupdateUser: string = this.baseUrl + "updateuser"
  private urlUpdateFile: string = this.baseUrl + "updateFile"
  private urlRenameNotebook: string = this.baseUrl + "RenameNotebook"
  private urlDeleteDatasetFromNotebook: string = this.baseUrl + "deleteDatasetFromNotebook/"
  private urlUpdateComment: string = this.baseUrl + "updatecomment/";
  private urlDeleteComment: string = this.baseUrl + "deletecomment/";
  private urlUpdateProjectLog: string = this.baseUrl + "updateprojectlog/";
  private urlDeleteProjectLog: string = this.baseUrl + "deletelog/";
  private urlRepostProjectLog: string = this.baseUrl + "repostlog/";
  private urlUpdatePublication: string = this.baseUrl + "updatePublication/";

  // Delete
  private urlDeleteProject: string = this.baseUrl + "deleteproject/"
  private urlRemoveUser: string = this.baseUrl + "removeuser/"
  private urlRemoveTag: string = this.baseUrl + "removetag/"
  private urlDeleteFile: string = this.baseUrl + "deleteFile/"
  private urlUnlikeComment: string = this.baseUrl + "likecomment/";
  private urlRemoveCommentReport: string = this.baseUrl + "removecommentreport/";
  private urlRemoveAllCommentReports: string = this.baseUrl + "removeallcommentreports/";
  private urlDeleteExpiredProjectLog: string = this.baseUrl + "deleteexpiredprojectlog/";
  private urlDeletePublication: string = this.baseUrl + "deletepublication/";

  // Extra
  private urlGetUserList: string = this.baseUrl + "getuserlist/"
  private urlGetFileList: string = this.baseUrl + "getfilelist/"
  private urlGetAllDatasetsList: string = this.baseUrl + "getAllDatasets/";
  private urlGetNotebookList: string = this.baseUrl + "getNotebooks/";
  private urlGetAllNotebookList: string = this.baseUrl + "getAllNotebooks/";
  private urlGetNotebook: string = this.baseUrl + "GetNotebook/";
  private urlGetTagList: string = this.baseUrl + "gettaglist/"

  private urlUploadNotebook: string = this.baseUrl + "uploadnotebook";
  private urlUploadNotebookNewVersion: string = this.baseUrl + "uploadnotebooknewversion";
  private urlUploadExistingNotebook: string = this.baseUrl + "uploadexistingnotebook";
  private urlDeleteNotebook: string = this.baseUrl + "deleteNotebook/";
  private urlGetShareableLink: string = this.baseUrl + "GetShareableLinkofFile/";


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
        // console.log("the body is: ", body);
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

  downloadCSV(blobFileID: number) {
    return this.http.get(this.urlDownloadFile + blobFileID, { responseType: "text" }).pipe(
      map(body => {
        return body;
      }),
      catchError(error => {
        console.log(error)
        return throwError(error)
      })
    )
  }

  downloadNotebook(notebook: Notebook, version: number) {
    return this.http.get(this.urlDownloadNotebook + notebook.notebookID + "/" + version, { responseType: "blob" }).pipe(
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

  getNotebookFile(notebook: Notebook, version: number): Observable<any> {
    return this.http.get(this.urlDownloadNotebook + notebook.notebookID + "/" + version, { responseType: "json" }).pipe(
      map(body => {
        if (body != null) {
          return body
        }
        else {
          alert('File is empty !');
          return null
        }
      }),
      catchError(error => {
        console.log(error)
        return throwError(error)
      })
    )
  }

  getNotebookVersions(notebook: Notebook): Observable<number[]> {
    return this.http.get<any>(this.urlGetNotebookVersions + notebook.notebookID).pipe(
      map(body => {
        console.log(body.versions)
        return body.versions
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
    body.append('route', currentUser.userName + "/" + projectName)

    const headers = new HttpHeaders().set('Authorization', `Bearer ${localStorage.getItem('jwt')}`);

    return this.http.post<any>(this.urlCreateProject, body, {headers})
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
    // body.append('userID', userID.toString())
    body.append('projectID', projectID.toString())
    for (let i = 0; i < blobFilesID.length; i++) {
      body.append('BlobFilesID', blobFilesID[i].toString())
    }
    body.getAll('BlobFilesID')

    const headers = new HttpHeaders().set('Authorization', `Bearer ${localStorage.getItem('jwt')}`);

    return this.http.post<any>(this.urlForkProject, body, {headers})
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

    const headers = new HttpHeaders().set('Authorization', `Bearer ${localStorage.getItem('jwt')}`);

    return this.http.post<any>(this.urlForkProjectWithoutBlob, body, {headers})
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

    const headers = new HttpHeaders().set('Authorization', `Bearer ${localStorage.getItem('jwt')}`);

    return this.http.post<any>(this.urlAddUser, body, {headers})
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

  followProject(projectID: number): Observable<ProjectUser> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${localStorage.getItem('jwt')}`);

    return this.http.post<any>(this.urlFollowProject + projectID, null, { headers }).pipe(
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

  unfollowProject(projectID: number): Observable<ProjectUser> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${localStorage.getItem('jwt')}`);

    return this.http.delete<any>(this.urlUnfollowProject + projectID, { headers }).pipe(
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

    const headers = new HttpHeaders().set('Authorization', `Bearer ${localStorage.getItem('jwt')}`);

    return this.http.post<any>(this.urlAddTag, body, {headers})
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
    // body.append('userID', userID.toString())
    body.append('projectID', projectID.toString())

    const headers = new HttpHeaders().set('Authorization', `Bearer ${localStorage.getItem('jwt')}`);

    return this.http.post<any>(this.urlUploadFile, body, {headers}).pipe(
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

  uploadNotebook(notebook: NotebookFile, directory: string) {
    let body = new FormData();
    body.append('NotebookFile', notebook.file);
    body.append('NotebookName', notebook.name);
    body.append('ProjectID', notebook.projectID.toString());
    body.append('directory', directory);

    const headers = new HttpHeaders().set('Authorization', `Bearer ${localStorage.getItem('jwt')}`);

    return this.http.post<any>(this.urlUploadNotebook, body, {headers}).pipe(
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

  uploadNotebookNewVersion(notebook: NotebookFile, directory: string) {
    let body = new FormData();
    body.append('NotebookFile', notebook.file);
    body.append('NotebookName', notebook.name);
    body.append('ProjectID', notebook.projectID.toString());
    body.append('directory', directory);

    const headers = new HttpHeaders().set('Authorization', `Bearer ${localStorage.getItem('jwt')}`);

    return this.http.post<any>(this.urlUploadNotebookNewVersion, body, {headers}).pipe(
      map(body => {
        console.log(body.message)
        return body.message
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
    body.append('observableNotebookDatasets', JSON.stringify(notebookURL.datasets));
    body.append('directory', directory);

    const headers = new HttpHeaders().set('Authorization', `Bearer ${localStorage.getItem('jwt')}`);

    return this.http.post<any>(this.urlUploadExistingNotebook, body, {headers}).pipe(
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
    // body.append('userID', userID.toString())
    body.append('projectID', projectID.toString())

    const headers = new HttpHeaders().set('Authorization', `Bearer ${localStorage.getItem('jwt')}`);

    return this.http.post<any>(this.urlCreateFolder, body, {headers}).pipe(
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

    const headers = new HttpHeaders().set('Authorization', `Bearer ${localStorage.getItem('jwt')}`);

    return this.http.post<any>(this.urlCreateNotebookFolder, body, {headers}).pipe(
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

  addDatasetToNotebook(notebookID: number, file: BlobFile): Observable<any> {
    let body = new FormData();
    body.append('notebookID', notebookID.toString());
    body.append('datasetName', `${file.name}${file.extension}`);
    body.append('blobFileID', file.blobFileID.toString());

    const headers = new HttpHeaders().set('Authorization', `Bearer ${localStorage.getItem('jwt')}`);

    return this.http.post<any>(this.urlAddDatasetToNotebook, body, {headers}).pipe(
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

    const headers = new HttpHeaders().set('Authorization', `Bearer ${localStorage.getItem('jwt')}`);

    return this.http.put<any>(this.urlUpdateProject + updateProject.projectID, body, {headers})
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

    const headers = new HttpHeaders().set('Authorization', `Bearer ${localStorage.getItem('jwt')}`);

    return this.http.put<any>(this.urlupdateUser, body, {headers})
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


  deleteDatasetFromNotebook(notebookID: number, file: BlobFile): Observable<any> {
    let body = new FormData();
    body.append('notebookID', notebookID.toString());
    body.append('blobFileID', file.blobFileID.toString());
    //console.log("calling delete dataset from notebook api");

    const headers = new HttpHeaders().set('Authorization', `Bearer ${localStorage.getItem('jwt')}`);

    return this.http.put<any>(this.urlDeleteDatasetFromNotebook, body, {headers}).pipe(
      map(result => {
        console.log("after calling delete dataset from notebook : ", result.message)
        return result.result
      }),
      catchError(error => {
        console.log(error)
        return throwError(error)
      })
    );
  }

  deleteProject(projectID: number): Observable<Project> {
    let body = new FormData()
    // body.append('projectID', projectID.toString())

    const headers = new HttpHeaders().set('Authorization', `Bearer ${localStorage.getItem('jwt')}`);

    return this.http.delete<any>(this.urlDeleteProject + projectID, {headers})
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
    const headers = new HttpHeaders().set('Authorization', `Bearer ${localStorage.getItem('jwt')}`);


    return this.http.delete<any>(this.urlRemoveUser + projectID + '/' + userID, {headers})
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

    const headers = new HttpHeaders().set('Authorization', `Bearer ${localStorage.getItem('jwt')}`);


    return this.http.delete<any>(this.urlRemoveTag + projectID + '/' + tagID, {headers})
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

  deleteFile(blobFileID: number, isMember: boolean): Observable<BlobFile> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${localStorage.getItem('jwt')}`);

    return this.http.delete<any>(this.urlDeleteFile + blobFileID + '/' + isMember, {headers})
    .pipe(
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

  deleteNotebook(notebookID: number, version: number, isMember: boolean): Observable<Notebook> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${localStorage.getItem('jwt')}`);

    return this.http.delete<any>(this.urlDeleteNotebook + notebookID + '/' + version + '/' + isMember, {headers}).pipe(
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

  getAllDatasets(): Observable<BlobFile[]> {

    return this.http.get<any>(this.urlGetAllDatasetsList)
      .pipe(
        map(body => {
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

  getAllNotebooks(): Observable<Notebook[]> {
    return this.http.get<any>(this.urlGetAllNotebookList)
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

  getNotebook(notebookID: number) {
    return this.http.get<any>(this.urlGetNotebook + notebookID)
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
    return this.http.get<any>(this.urlGetShareableLink + fileID)
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

  renameNotebook(notebookID: number, newName: string): Observable<Notebook> {
    let body = new FormData()
    body.append('NotebookID', notebookID.toString());
    body.append('NotebookName', newName)
    return this.http.put<any>(this.urlRenameNotebook, body)
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

  getProjectComments(projectID: number): Observable<ProjectComment[]> {
    return this.http.get<any>(this.urlGetProjectComments + projectID)
      .pipe(
        map(body => {
          console.log(body.message);
          return body.result;
        }),
        catchError(error => {
          console.log(error);
          return throwError(() => error);
        })
      );
  }

  postComment(projectID: number, content: string, parentID: number | null, projectLogID: number | null): Observable<any> {
    let body = new FormData();
    body.append('projectID', projectID.toString());
    body.append('content', content);
    if(parentID != null) body.append('parentCommentID', parentID.toString());
    if(projectLogID != null) body.append('projectLogID', projectLogID.toString());

    const headers = new HttpHeaders().set(
      'Authorization', 
      `Bearer ${localStorage.getItem('jwt')}`
    );

    return this.http.post<any>(this.urlPostComment, body, {headers}).pipe(
      map(body => {
        console.log(body.message);
        return body;
      }),
      catchError(error => {
        console.log(error);
        return throwError(error);
      })
    );
  }

  updateComment(commentID: number, content: string): Observable<any> {
    let body = new FormData();
    body.append('content', content);

    const headers = new HttpHeaders().set(
      'Authorization', 
      `Bearer ${localStorage.getItem('jwt')}`
    );

    return this.http.put<any>(this.urlUpdateComment + commentID, body, {headers}).pipe(
      map(body => {
        console.log(body.message);
        return body;
      }),
      catchError(error => {
        console.log(error);
        return throwError(error);
      })
    );
  }

  deleteComment(commentID: number): Observable<any> {
    const headers = new HttpHeaders().set(
      'Authorization', 
      `Bearer ${localStorage.getItem('jwt')}`
    );

    return this.http.put<any>(this.urlDeleteComment + commentID, null, {headers}).pipe(
      map(body => {
        console.log(body.message);
        return body;
      }),
      catchError(error => {
        console.log(error);
        return throwError(error);
      })
    );
  }
  
  likeComment(commentID: number): Observable<any> {
    const headers = new HttpHeaders().set(
      'Authorization', 
      `Bearer ${localStorage.getItem('jwt')}`
    );

    return this.http.post<any>(this.urlLikeComment + commentID, null, {headers}).pipe(
      map(body => {
        console.log(body.message);
        return body;
      }),
      catchError(error => {
        console.log(error);
        return throwError(error);
      })
    );
  }

  unlikeComment(commentID: number): Observable<any> {
    const headers = new HttpHeaders().set(
      'Authorization', 
      `Bearer ${localStorage.getItem('jwt')}`
    );

    return this.http.delete<any>(this.urlUnlikeComment + commentID, {headers}).pipe(
      map(body => {
        console.log(body.message);
        return body;
      }),
      catchError(error => {
        console.log(error);
        return throwError(error);
      })
    );
  }

  reportComment(commentID: number): Observable<any> {
    const headers = new HttpHeaders().set(
      'Authorization', 
      `Bearer ${localStorage.getItem('jwt')}`
    );

    return this.http.post<any>(this.urlReportComment + commentID, null, {headers}).pipe(
      map(body => {
        console.log(body.message);
        return body;
      }),
      catchError(error => {
        console.log(error);
        return throwError(error);
      })
    );
  }

  removeCommentReport(commentID: number): Observable<any> {
    const headers = new HttpHeaders().set(
      'Authorization', 
      `Bearer ${localStorage.getItem('jwt')}`
    );

    return this.http.delete<any>(this.urlRemoveCommentReport + commentID, {headers}).pipe(
      map(body => {
        console.log(body.message);
        return body;
      }),
      catchError(error => {
        console.log(error);
        return throwError(error);
      })
    );
  }

  removeallCommentReports(commentID: number): Observable<any> {
    const headers = new HttpHeaders().set(
      'Authorization', 
      `Bearer ${localStorage.getItem('jwt')}`
    );

    return this.http.delete<any>(this.urlRemoveAllCommentReports + commentID, {headers}).pipe(
      map(body => {
        console.log(body.message);
        return body;
      }),
      catchError(error => {
        console.log(error);
        return throwError(error);
      })
    );
  }

  getFlaggedProjectComments(): Observable<FlaggedCommentGroup[]> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${localStorage.getItem('jwt')}`);

    return this.http.get<any>(this.urlGetFlaggedProjectComments, {headers}).pipe(
      map(body => {
        console.log(body.message);
        return body.result;
      }),
      catchError(error => {
        console.log(error);
        return throwError(() => error);
      })
    );
  }

  deleteCommentAndReports(commentID: number): Observable<any> {
    const headers = new HttpHeaders().set(
      'Authorization', 
      `Bearer ${localStorage.getItem('jwt')}`
    );

    return this.http.post<any>(this.urlDeleteCommentandReports + commentID, null, {headers}).pipe(
      map(body => {
        console.log(body.message);
        return body;
      }),
      catchError(error => {
        console.log(error);
        return throwError(error);
      })
    );
  }

  getPublications(projectID: number): Observable<Publication[]> {
    return this.http.get<any>(this.urlGetPublications + projectID)
      .pipe(
        map(body => {
          console.log(body.message);
          return body.result;
        }),
        catchError(error => {
          console.log(error);
          return throwError(() => error);
        })
      );
  }

  addPublication(formData: FormData): Observable<any> {
    const headers = new HttpHeaders().set(
      'Authorization', 
      `Bearer ${localStorage.getItem('jwt')}`
    );

    return this.http.post<any>(this.urlAddPublication, formData, {headers}).pipe(
      map(body => {
        console.log(body.message);
        return body;
      }),
      catchError(error => {
        console.log(error);
        return throwError(error);
      })
    );
  }

  deletePublication(publicationId: number): Observable<any> {
    const headers = new HttpHeaders().set(
      'Authorization', 
      `Bearer ${localStorage.getItem('jwt')}`
    );

    return this.http.delete<any>(this.urlDeletePublication + publicationId, {headers}).pipe(
      map(body => {
        console.log(body.message);
        return body;
      }),
      catchError(error => {
        console.log(error);
        return throwError(error);
      })
    );
  }

  updatePublication(formData: FormData, publicationId: number): Observable<any> {
    const headers = new HttpHeaders().set(
      'Authorization', 
      `Bearer ${localStorage.getItem('jwt')}`
    );

    return this.http.put<any>(this.urlUpdatePublication + publicationId, formData, {headers}).pipe(
      map(body => {
        console.log(body.message);
        return body;
      }),
      catchError(error => {
        console.log(error);
        return throwError(error);
      })
    );
  }
  
  getProjectLogs(projectID: number): Observable<ProjectLog[]> {
    return this.http.get<any>(this.urlGetProjectLogs + projectID)
      .pipe(
        map(body => {
          console.log(body.message);
          return body.result;
        }),
        catchError(error => {
          console.log(error);
          return throwError(() => error);
        })
      );
  }

  addProjectLog(formData: FormData): Observable<any> {
    const headers = new HttpHeaders().set(
      'Authorization', 
      `Bearer ${localStorage.getItem('jwt')}`
    );

    return this.http.post<any>(this.urlAddProjectLog, formData, {headers}).pipe(
      map(body => {
        console.log(body.message);
        return body;
      }),
      catchError(error => {
        console.log(error);
        return throwError(error);
      })
    );
  }

  updateProjectLog(formData: FormData, logId: number): Observable<any> {
    const headers = new HttpHeaders().set(
      'Authorization', 
      `Bearer ${localStorage.getItem('jwt')}`
    );

    return this.http.put<any>(this.urlUpdateProjectLog + logId, formData, {headers}).pipe(
      map(body => {
        console.log(body.message);
        return body;
      }),
      catchError(error => {
        console.log(error);
        return throwError(error);
      })
    );
  }

  getProjectLogComments(projectLogID: number): Observable<ProjectComment[]> {
    return this.http.get<any>(this.urlGetProjectLogComments + projectLogID)
      .pipe(
        map(body => {
          console.log(body.message);
          return body.result;
        }),
        catchError(error => {
          console.log(error);
          return throwError(() => error);
        })
      );
  }

  deleteProjectLog(logID: number): Observable<any> {
    const headers = new HttpHeaders().set(
      'Authorization', 
      `Bearer ${localStorage.getItem('jwt')}`
    );

    return this.http.put<any>(this.urlDeleteProjectLog + logID, null, {headers}).pipe(
      map(body => {
        console.log(body.message);
        return body;
      }),
      catchError(error => {
        console.log(error);
        return throwError(error);
      })
    );
  }

  repostProjectLog(logID: number): Observable<any> {
    const headers = new HttpHeaders().set(
      'Authorization', 
      `Bearer ${localStorage.getItem('jwt')}`
    );

    return this.http.put<any>(this.urlRepostProjectLog + logID, null, {headers}).pipe(
      map(body => {
        console.log(body.message);
        return body;
      }),
      catchError(error => {
        console.log(error);
        return throwError(error);
      })
    );
  }

  getExpiredProjectLogs(): Observable<ExpiredProjectLog[]> {
    const headers = new HttpHeaders().set(
      'Authorization', 
      `Bearer ${localStorage.getItem('jwt')}`
    );

    return this.http.get<any>(this.urlGetExpiredProjectLogs, {headers})
      .pipe(
        map(body => {
          console.log(body.message);
          return body.result;
        }),
        catchError(error => {
          console.log(error);
          return throwError(() => error);
        })
      );
  }

  deleteExpiredProjectLog(logID: number): Observable<any> {
    const headers = new HttpHeaders().set(
      'Authorization', 
      `Bearer ${localStorage.getItem('jwt')}`
    );

    return this.http.delete<any>(this.urlDeleteExpiredProjectLog + logID, {headers}).pipe(
      map(body => {
        console.log(body.message);
        return body;
      }),
      catchError(error => {
        console.log(error);
        return throwError(error);
      })
    );
  }
}
