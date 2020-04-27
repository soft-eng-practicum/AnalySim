import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { Project } from '../interfaces/project';
import { AccountService } from './account.service';

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
  private baseUrlAddUser : string = "/api/Project/AddUser";

  // Put
  private baseUrlUpdate : string = "/api/Project/Update";
  private baseUrlUpdateUser : string = "/api/Project/UpdateUser";

  // Get
  private baseUrlGetUser : string = "/api/Project/GetUser/";
  private baseUrlGetBlobFiles : string = "/api/Project/GetBlobFiles/";
  
  // Delete
  private baseUrlDelete : string = "/api/Project/Delete/";


  private projectList$: Observable<Project[]>
  private userProjectList$: Observable<Project[]>



  CreateProject (newProject: Project)
  {
    let body = new FormData()
    body.append('name', newProject.name)
    body.append('visibility', newProject.visibility)
    body.append('description', newProject.description)
    body.append('userid', this.accountService.currentUserID.value)

    return this.http.post<any>(this.baseUrlCreate, body).pipe(
      map(result => {
        return result
      },
      error =>{
        return error
      })
    );
  }

  /*
  AddUser (userID: string, projectID: string, userRole: string)
  {
    let body = new FormData()
    body.append('userid', userID)
    body.append('projectid', projectID)
    body.append('userrole', userRole)

    return this.http.post<any>(this.baseUrlAddUser, body).pipe(
      map(result => {
        return result
      },
      error =>{
        return error
      })
    );
  }

  UpdateProject (name: string, visibility: string, description: string)
  {
    let body = new FormData()
    body.append('name', name)
    body.append('visibility', visibility)
    body.append('description', description)

    return this.http.post<any>(this.baseUrlUpdate, body).pipe(
      map(result => {
        return result
      },
      error =>{
        return error
      })
    );
  }

  UpdateUser (userID: string, projectID: string, userRole: string)
  {
    let body = new FormData()
    body.append('userid', userID)
    body.append('projectid', projectID)
    body.append('userrole', userRole)

    return this.http.post<any>(this.baseUrlUpdateUser, body).pipe(
      map(result => {
        return result
      },
      error =>{
        return error
      })
    );
  }

  GetUser ()
  {
    let body = new FormData()
    body.append('name', name)
    body.append('visibility', visibility)
    body.append('description', description)
    body.append('userid', userID)

    return this.http.post<any>(this.baseUrlGetUser, body).pipe(
      map(result => {
        return result
      },
      error =>{
        return error
      })
    );
  }

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

  DeleteProject ()
  {

    return this.http.post<any>(this.baseUrlDelete).pipe(
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
