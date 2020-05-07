import { Component, OnInit } from '@angular/core';
import { ProjectService } from '../services/project.service';
import { Project } from '../interfaces/project';
import { ProjectTag } from '../interfaces/project-tag';

@Component({
  selector: 'app-explore',
  templateUrl: './explore.component.html',
  styleUrls: ['./explore.component.css']
})
export class ExploreComponent implements OnInit {

  constructor(private projectService : ProjectService) { }

  projects : Project[]
  tags : ProjectTag[]
  searchTerm : string

  ngOnInit(): void {
    this.projectService.ReadProjectList().subscribe(
      result =>{
        this.projects = result
      }, error =>{
        console.log("Error");      
      });
  }

  onSubmit(){
    if(!this.searchTerm)
    {
      this.projectService.ReadProjectList().subscribe(
        result =>{
          this.projects = result
        }, error =>{
          console.log("Error");      
        });
    }
    else{
      this.projectService.Search(this.searchTerm).subscribe(
        result =>{
          this.projects = result
        }, error =>{
          console.log("Error");      
        });
    }


  }

}
