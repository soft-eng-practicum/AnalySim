import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Project } from '../interfaces/project';
import { ProjectService } from './project.service';

@Injectable({
  providedIn: 'root'
})
export class ExploreService {

  constructor(
    private router: Router,
    private projectService: ProjectService
  ) { }

  public projects : Project[]

  private searchProject(searchTerms : string[]){
    this.projects = null
    if(searchTerms.length == 0){
      this.projectService.getProjectList().subscribe(
        result =>{
          this.projects = result
        }, error =>{
          console.log(error);      
        });
    }
    else{
      this.projectService.search(searchTerms).subscribe(
        result =>{
          this.projects = result
        }, error =>{
          console.log(error);      
        });
    }
  }

  exploreProject(tagValue: string){
    const searchTerms: string[] = Array.from(
      new Set(tagValue.split(' ').filter(x => x.length !== 0))
    );
    this.searchProject(searchTerms)
    this.router.navigate(['/explore'], { queryParams: { category : 'project', term : JSON.stringify(searchTerms)}})
  }
}
