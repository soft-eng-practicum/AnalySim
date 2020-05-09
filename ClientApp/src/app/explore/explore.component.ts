import { Component, OnInit } from '@angular/core';
import { ProjectService } from '../services/project.service';
import { Project } from '../interfaces/project';
import { ProjectTag } from '../interfaces/project-tag';
import { FormGroup, FormControl, FormBuilder } from '@angular/forms';
import { AccountService } from '../services/account.service';
import { ApplicationUser } from '../interfaces/user';

@Component({
  selector: 'app-explore',
  templateUrl: './explore.component.html',
  styleUrls: ['./explore.component.css']
})
export class ExploreComponent implements OnInit {

  constructor(private projectService : ProjectService,
    private accountService : AccountService,
    private formBuilder : FormBuilder) { }

  // Form Control - Create Project
  searchForm: FormGroup;
  searchCategory: FormControl;
  searchTerm: FormControl;
  

  projects : Project[]
  users : ApplicationUser[]

  ngOnInit(): void {
    this.projectService.ReadProjectList().subscribe(
      result =>{
        this.projects = result
      }, error =>{
        console.log("Error");      
      });

    this.accountService.ReadUserList().subscribe(
      result =>{
        this.users = result
      }, error =>{
        console.log("Error");      
      });

    // Initialize Form Controls
    this.searchCategory = new FormControl('project');
    this.searchTerm = new FormControl('');

    // Initialize FormGroup using FormBuilder
    this.searchForm = this.formBuilder.group({
        searchCategory : this.searchCategory,
        searchTerm : this.searchTerm
    });
  }

  onSubmit(){
    let searchForm = this.searchForm.value
    switch(searchForm.searchCategory)
    {
        case "project":
          if(searchForm.searchTerm == "" || !searchForm.searchTerm){
            this.projectService.ReadProjectList().subscribe(
              result =>{
                this.projects = result
              }, error =>{
                console.log("Error");      
              });
          }
          else{
          this.projectService.Search(searchForm.searchTerm).subscribe(
            result =>{
              this.projects = result
            }, error =>{
              console.log("Error");      
            });
          }
        break
        case "profile":
          if(searchForm.searchTerm == "" || !searchForm.searchTerm){
            this.accountService.ReadUserList().subscribe(
              result =>{
                this.users = result
              }, error =>{
                console.log("Error");      
              });
          }
          else{
          this.accountService.Search(searchForm.searchTerm).subscribe(
            result =>{
              this.users = result
            }, error =>{
              console.log("Error");      
            });
          }
        break
    }
    


  }

}
