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
import { ProjectComment } from '../interfaces/project-comment';
import { FlaggedCommentGroup } from '../interfaces/project-comment-flag';
import { ProjectLog } from '../interfaces/project-log';
import { ExpiredProjectLog } from '../interfaces/expired-project-log';
import { Publication } from '../interfaces/publication';
import { ProjectMembershipRequest } from '../interfaces/project-membership-request';

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
  private urlGetProjectNotebookRefs: string = this.baseUrl + "getprojectnotebookreferences/";
  private urlGetProjectMembershipRequests: string = this.baseUrl + "getprojectmembershiprequests/";
  private urlGetMyMembershipRequests: string = this.baseUrl + "getmymembershiprequests";

  // Post
  private urlCreateProject: string = this.baseUrl + "createproject"
  private urlRequestJoinProject: string = this.baseUrl + "requestjoinproject/"
  private urlInviteProjectMember: string = this.baseUrl + "inviteprojectmember"
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
  private urlAcceptProjectMembershipRequest: string = this.baseUrl + "acceptprojectmembershiprequest/"
  private urlRejectProjectMembershipRequest: string = this.baseUrl + "rejectprojectmembershiprequest/"
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
  private urlCancelProjectMembershipRequest: string = this.baseUrl + "cancelprojectmembershiprequest/"
  private urlLeaveProject: string = this.baseUrl + "leaveproject/"
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
    // body.append('userID', userID.toString())
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

  getProjectMembershipRequests(projectID: number): Observable<ProjectMembershipRequest[]> {
    return this.http.get<any>(this.urlGetProjectMembershipRequests + projectID)
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

  getMyMembershipRequests(): Observable<ProjectMembershipRequest[]> {
    return this.http.get<any>(this.urlGetMyMembershipRequests)
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

  requestJoinProject(projectID: number): Observable<ProjectMembershipRequest> {
    return this.http.post<any>(this.urlRequestJoinProject + projectID, null)
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

  inviteProjectMember(projectID: number, userID: number, message: string = ''): Observable<ProjectMembershipRequest> {
    let body = new FormData()
    body.append('projectid', projectID.toString())
    body.append('userid', userID.toString())
    body.append('message', message)
    return this.http.post<any>(this.urlInviteProjectMember, body)
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

  acceptProjectMembershipRequest(requestID: number): Observable<ProjectUser> {
    return this.http.put<any>(this.urlAcceptProjectMembershipRequest + requestID, null)
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

  rejectProjectMembershipRequest(requestID: number): Observable<ProjectMembershipRequest> {
    return this.http.put<any>(this.urlRejectProjectMembershipRequest + requestID, null)
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

  cancelProjectMembershipRequest(requestID: number): Observable<ProjectMembershipRequest> {
    return this.http.delete<any>(this.urlCancelProjectMembershipRequest + requestID)
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

  leaveProject(projectID: number): Observable<ProjectUser> {
    return this.http.delete<any>(this.urlLeaveProject + projectID)
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
    return this.http.post<any>(this.urlFollowProject + projectID, null).pipe(
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
    return this.http.delete<any>(this.urlUnfollowProject + projectID).pipe(
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
    // body.append('userID', userID.toString())
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

  uploadNotebook(notebook: NotebookFile, directory: string) {
    let body = new FormData();
    body.append('NotebookFile', notebook.file);
    body.append('NotebookName', notebook.name);
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

  uploadNotebookNewVersion(notebook: NotebookFile, directory: string) {
    let body = new FormData();
    body.append('NotebookFile', notebook.file);
    body.append('NotebookName', notebook.name);
    body.append('ProjectID', notebook.projectID.toString());
    body.append('directory', directory);
    return this.http.post<any>(this.urlUploadNotebookNewVersion, body).pipe(
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
    // body.append('userID', userID.toString())
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

  addDatasetToNotebook(notebookID: number, file: BlobFile): Observable<any> {
    let body = new FormData();
    body.append('notebookID', notebookID.toString());
    body.append('datasetName', `${file.name}${file.extension}`);
    body.append('blobFileID', file.blobFileID.toString());
    return this.http.post<any>(this.urlAddDatasetToNotebook, body).pipe(
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

  deleteDatasetFromNotebook(notebookID: number, file: BlobFile): Observable<any> {
    let body = new FormData();
    body.append('notebookID', notebookID.toString());
    body.append('blobFileID', file.blobFileID.toString());
    //console.log("calling delete dataset from notebook api");
    return this.http.put<any>(this.urlDeleteDatasetFromNotebook, body).pipe(
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

  deleteFile(blobFileID: number, isMember: boolean): Observable<BlobFile> {
    return this.http.delete<any>(this.urlDeleteFile + blobFileID + '/' + isMember)
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
    return this.http.delete<any>(this.urlDeleteNotebook + notebookID + '/' + version + '/' + isMember).pipe(
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
    return this.http.post<any>(this.urlPostComment, body).pipe(
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
    return this.http.put<any>(this.urlUpdateComment + commentID, body).pipe(
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
    return this.http.put<any>(this.urlDeleteComment + commentID, null).pipe(
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
    return this.http.post<any>(this.urlLikeComment + commentID, null).pipe(
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
    return this.http.delete<any>(this.urlUnlikeComment + commentID).pipe(
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
    return this.http.post<any>(this.urlReportComment + commentID, null).pipe(
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
    return this.http.delete<any>(this.urlRemoveCommentReport + commentID).pipe(
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
    return this.http.delete<any>(this.urlRemoveAllCommentReports + commentID).pipe(
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
    return this.http.get<any>(this.urlGetFlaggedProjectComments).pipe(
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
    return this.http.post<any>(this.urlDeleteCommentandReports + commentID, null).pipe(
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
    return this.http.post<any>(this.urlAddPublication, formData).pipe(
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
    return this.http.delete<any>(this.urlDeletePublication + publicationId).pipe(
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
    return this.http.put<any>(this.urlUpdatePublication + publicationId, formData).pipe(
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
    return this.http.post<any>(this.urlAddProjectLog, formData).pipe(
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
    return this.http.put<any>(this.urlUpdateProjectLog + logId, formData).pipe(
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
    return this.http.put<any>(this.urlDeleteProjectLog + logID, null).pipe(
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
    return this.http.put<any>(this.urlRepostProjectLog + logID, null).pipe(
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
    return this.http.get<any>(this.urlGetExpiredProjectLogs)
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
    return this.http.delete<any>(this.urlDeleteExpiredProjectLog + logID).pipe(
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

  getProjectNotebookReferences(projectID: number) {
    return this.http.get<any>(this.urlGetProjectNotebookRefs + projectID).pipe(
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
