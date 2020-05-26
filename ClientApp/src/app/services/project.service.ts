import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { Project } from '../interfaces/project';
import { AccountService } from './account.service';
import { flatMap, shareReplay } from 'rxjs/operators';
import { ProjectUser } from '../interfaces/project-user';
import { BlobFile } from '../interfaces/blob-file';
import { Tag } from '../interfaces/tag';
import { ProjectTag } from '../interfaces/project-tag';

@Injectable({
  providedIn: 'root'
})
export class ProjectService {

  constructor(
    private http : HttpClient, 
    private router: Router,
    private accountService: AccountService) { }

  // Url to access Web API
  private baseUrl : string = '/api/project/'

  // Get
  private urlGetProjectList : string = this.baseUrl + "getprojectList"
  private urlGetProjectByID : string = this.baseUrl + "getprojectbyid/"
  private urlGetProjectByRoute : string = this.baseUrl + "getprojectbyroute/"
  private urlGetUserList : string = this.baseUrl + "getuserlist/"
  private urlSearch : string = this.baseUrl + "search/"
  private urlGetFileList : string = this.baseUrl + "getfilelist/"
  private urlGetTagList : string = this.baseUrl + "gettaglist/"

  // Post
  private urlCreateProject : string = this.baseUrl + "createproject"
  private urlAddUser : string = this.baseUrl + "adduser"
  private urlAddTag : string = this.baseUrl + "addtag"

  // Put
  private urlUpdateProject : string = this.baseUrl + "updateproject/"
  private urlupdateUser : string = this.baseUrl + "updateuser"

  // Delete
  private urlDeleteProject : string = this.baseUrl + "deleteproject/"
  private urlRemoveUser : string = this.baseUrl + "removeuser/"
  private urlRemoveTag : string = this.baseUrl + "removetag/"


  getProjectList () : Observable<Project[]>
  {
    return this.http.get<any>(this.urlGetProjectList).pipe(
      map(result => {
        console.log(result.message)
        return result.resultObject
      },
      error =>{
        console.log(error)
        return error
      })
    );
  }

  getProjectByID (projectID: number) : Observable<Project>
  {
    return this.http.get<any>(this.urlGetProjectByID + projectID).pipe(
      map(result => {
        console.log(result.message)
        return result.resultObject[0]
      },
      error =>{
        console.log(error)
        return error
      })
    );
  }

  getProjectByRoute (owner: string, projectName: string) : Observable<Project>
  {
    return this.http.get<any>(this.urlGetProjectByRoute + owner + "/" + projectName).pipe(
      map(result => {
        console.log(result.message)
        return result.resultObject[0]
      },
      error =>{
        console.log(error)
        return error
      })
    );
  }

  getUserList (projectID: number) : Observable<ProjectUser[]>
  {

    return this.http.get<any>(this.urlGetUserList + projectID).pipe(
      map(result => {
        console.log(result.message)
        return result.resultObject
      },
      error =>{
        console.log(error)
        return error
      })
    );
  }

  search (searchTerm: string) : Observable<Project[]>
  {
    return this.http.get<any>(this.urlSearch + searchTerm).pipe(
      map(result => {
        console.log(result.message)
        return result.resultObject
      },
      error =>{
        console.log(error)
        return error
      })
    );
  }

  getFileList (projectID: number) : Observable<BlobFile[]>
  {

    return this.http.get<any>(this.urlGetFileList + projectID).pipe(
      map(result => {
        console.log(result.message)
        return result.resultObject
      },
      error =>{
        console.log(error)
        return error
      })
    );
  }

  getTagList (projectID: number) : Observable<Tag[]>
  {

    return this.http.get<any>(this.urlGetTagList + projectID).pipe(
      map(result => {
        console.log(result.message)
        return result.resultObject
      },
      error =>{
        console.log(error)
        return error
      })
    );
  }

  createProject (projectName : string, visibility : string, description : string) : Observable<Project>
  {
    let userid
    this.accountService.currentUserID.subscribe(value => userid = value)
    let username
    this.accountService.currentUsername.subscribe(value => username = value)

    let body = new FormData()
    body.append('name', projectName)
    body.append('visibility', visibility)
    body.append('description', description)
    body.append('userid', userid)
    body.append('route', username + "/" + projectName)

    return this.http.post<any>(this.urlCreateProject, body).pipe(
      map(result => {
        console.log(result.message)
        return result.resultObject
      },
      error =>{
        console.log(error)
        return error
      })
    )
  }
  
  addUser (projectID : number, userID : number, userRole: string, isFollowing : boolean) : Observable<ProjectUser>
  {
    let body = new FormData()
    body.append('projectid', projectID.toString())
    body.append('userid', userID.toString())
    body.append('userrole', userRole)
    body.append('isFollowing', isFollowing ? 'true' : 'false')

    return this.http.post<any>(this.urlAddUser, body).pipe(
      map(result => {
        console.log(result.message)
        return result.resultObject
      },
      error =>{
        console.log(error)
        return error
      })
    );
  }

  addTag (projectID : number, tagName : string) : Observable<ProjectTag>
  {
    let body = new FormData()
    body.append('projectid', projectID.toString())
    body.append('tagname', tagName.toString())

    return this.http.post<any>(this.urlAddTag, body).pipe(
      map(result => {
        console.log(result.message)
        return result.resultObject
      },
      error =>{
        console.log(error)
        return error
      })
    );
  }

  updateProject (updateProject: Project) : Observable<Project>
  {
    let body = new FormData()
    body.append('name', updateProject.name)
    body.append('visibility', updateProject.visibility)
    body.append('description', updateProject.description)

    return this.http.put<any>(this.urlUpdateProject, body).pipe(
      map(result => {
        console.log(result.message)
        return result.resultObject
      },
      error =>{
        console.log(error)
        return error
      })
    );
  }

  updateUser (userRole : ProjectUser) : Observable<ProjectUser>
  {
    let body = new FormData()
    body.append('userid', userRole.userID.toString())
    body.append('projectid', userRole.projectID.toString())
    body.append('userrole', userRole.userRole)
    body.append('isFollowing', userRole.isFollowing ? 'true' : 'false')

    return this.http.put<any>(this.urlupdateUser, body).pipe(
      map(result => {
        console.log(result.message)
        return result.resultObject
      },
      error =>{
        console.log(error)
        return error
      })
    );
  }

  deleteProject (projectID: string)
  {

    return this.http.delete<any>(this.urlDeleteProject + projectID).pipe(
      map(result => {
        console.log(result.message)
        return result.resultObject
      },
      error =>{
        console.log(error)
        return error
      })
    );
  }

  removeUser (projectID: number, userID : number) : Observable<ProjectUser>
  {

    return this.http.delete<any>(this.urlRemoveUser + projectID + '/' + userID).pipe(
      map(result => {
        console.log(result.message)
        return result.resultObject
      },
      error =>{
        console.log(error)
        return error
      })
    );
  }

  removeTag (projectID: number, tagID : number) : Observable<ProjectUser>
  {

    return this.http.delete<any>(this.urlRemoveTag + projectID + '/' + tagID).pipe(
      map(result => {
        console.log(result.message)
        return result.resultObject
      },
      error =>{
        console.log(error)
        return error
      })
    );
  }

}
