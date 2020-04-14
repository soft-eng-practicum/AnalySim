import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class ProjectService {

  constructor(private http : HttpClient, private router: Router) { }

  // Url to access Web API
  private baseUrlProject : string = "/api/account/project";




}
