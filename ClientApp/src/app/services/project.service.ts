import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { Project } from '../interfaces/project';
import { AccountService } from './account.service';
import { ApplicationUserProject } from '../interfaces/application-user-project';
import { flatMap, shareReplay } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ProjectService {

  constructor(
    private http : HttpClient, 
    private router: Router,
    private accountService: AccountService) { }

  // Url to access Web API
  // Post
  private baseUrlCreate : string = "/api/Project/Create";
  private baseUrlCreateUserRole : string = "/api/Project/CreateUserRole";

  // Get
  private baseUrlRead : string = "/api/Project/Read";
  private baseUrlReadID : string = "/api/Project/Read/";
  private baseUrlReadUserRole : string = "/api/Project/ReadUserRole/";
  private baseUrlSearch : string = "/api/Project/Search/";

  // Put
  private baseUrlUpdate : string = "/api/Project/Update";
  private baseUrlUpdateUser : string = "/api/Project/UpdateUserRole";

  // Delete
  private baseUrlDelete : string = "/api/Project/Delete/";
  private baseUrlDeleteUserRole : string = "/api/Project/DeleteUserRole";

  CreateProject (newProject: Project) : Observable<Project>
  {
    let userid
    this.accountService.currentUserID.subscribe(value => userid = value);
    let username
    this.accountService.currentUsername.subscribe(value => username = value);

    let body = new FormData()
    body.append('name', newProject.name)
    body.append('visibility', newProject.visibility)
    body.append('description', newProject.description)
    body.append('userid', userid)
    body.append('route', username + "/" + newProject.name)

    return this.http.post<any>(this.baseUrlCreate, body).pipe(
      map(result => {
        console.log(result.message)
        return result.project[0]
      },
      error =>{
        return error
      })
    );
  }

  CreateUserRole (userRole : ApplicationUserProject) : Observable<ApplicationUserProject>
  {
    let body = new FormData()
    body.append('userid', userRole.applicationUserID)
    body.append('projectid', userRole.projectID.toString())
    body.append('userrole', userRole.userRole)

    return this.http.post<any>(this.baseUrlCreateUserRole, body).pipe(
      map(result => {
        console.log(result.message)
        return result.user[0]
      },
      error =>{
        return error
      })
    );
  }

  ReadProjectList () : Observable<Project[]>
  {
    return this.http.get<any>(this.baseUrlRead).pipe(
      map(result => {
        console.log(result.message)
        console.log(result.project)
        return result.project
      },
      error =>{
        return error
      })
    );
  }

  ReadUserProject (userID: string) : Observable<Project[]>
  {
    return this.http.get<any>(this.baseUrlReadID + userID).pipe(
      map(result => {
        console.log(result.message)
        return result.project
      },
      error =>{
        return error
      })
    );
  }

  ReadProject (owner: string, projectname?: string) : Observable<Project>
  {
    return this.http.get<any>(this.baseUrlRead + "/" + owner + "/" + projectname).pipe(
      map(result => {
        console.log(result.message)
        return result.project
      },
      error =>{
        return error
      })
    );
  }

  ReadUserRole (projectID: string) : Observable<ApplicationUserProject[]>
  {

    return this.http.get<any>(this.baseUrlReadUserRole + projectID).pipe(
      map(result => {
        console.log(result.message)
        return result.user
      },
      error =>{
        return error
      })
    );
  }

  Search (searchTerm: string) : Observable<Project[]>
  {
    return this.http.get<any>(this.baseUrlSearch + searchTerm).pipe(
      map(result => {
        console.log(result.message)
        return result.project
      },
      error =>{
        return error
      })
    );
  }

  UpdateProject (updateProject: Project) : Observable<Project>
  {
    let body = new FormData()
    body.append('name', updateProject.name)
    body.append('visibility', updateProject.visibility)
    body.append('description', updateProject.description)

    return this.http.put<any>(this.baseUrlUpdate, body).pipe(
      map(result => {
        console.log(result.message)
        return result.project[0]
      },
      error =>{
        return error
      })
    );
  }

  UpdateUserRole (userRole : ApplicationUserProject) : Observable<ApplicationUserProject>
  {
    let body = new FormData()
    body.append('userid', userRole.applicationUserID)
    body.append('projectid', userRole.projectID.toString())
    body.append('userrole', userRole.userRole)
    body.append('isfollowing', JSON.stringify(userRole.isFollowing))

    return this.http.put<any>(this.baseUrlUpdateUser, body).pipe(
      map(result => {
        console.log(result.message)
        return result.user
      },
      error =>{
        return error
      })
    );
  }

  DeleteProject (projectID: string)
  {

    return this.http.delete<any>(this.baseUrlDelete + projectID).pipe(
      map(result => {
        console.log(result.message)
        return result.project[0]
      },
      error =>{
        return error
      })
    );
  }

  DeleteUserRole (projectID: string, userID : string) : Observable<ApplicationUserProject>
  {

    return this.http.delete<any>(this.baseUrlDeleteUserRole + projectID + '/' + userID).pipe(
      map(result => {
        console.log(result.message)
        return result.user[0]
      },
      error =>{
        return error
      })
    );
  }



  /*
  

  

  

  

  GetBlobFiles (userID: string, projectID: string, userRole: string)
  {
    let body = new FormData()
    body.append('userid', userID)
    body.append('projectid', projectID)
    body.append('userrole', userRole)

    return this.http.post<any>(this.baseUrlGetBlobFiles, body).pipe(
      map(result => {
        return result
      },
      error =>{
        return error
      })
    );
  }

  
  */

}
