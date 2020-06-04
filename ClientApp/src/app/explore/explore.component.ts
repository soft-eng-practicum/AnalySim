import { Component, OnInit } from '@angular/core';
import { ProjectService } from '../services/project.service';
import { Project } from '../interfaces/project';
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
    this.projects = null
    this.users = null

    // Load Project
    this.projectService.getProjectList().subscribe(
      result =>{
        this.projects = result
        console.log(result)
      }, error =>{
        console.log(error);      
      });

    // Load User
    this.accountService.getUserList().subscribe(
      result =>{
        this.users = result
      }, error =>{
        console.log(error);      
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
    let searchTerms : string[] = searchForm.searchTerm.split(' ')
    switch(searchForm.searchCategory)
    {
        case "project":
          this.projects = null
          if(searchForm.searchTerm == "" || !searchForm.searchTerm){
            this.projectService.getProjectList().subscribe(
              result =>{
                this.projects = result
              }, error =>{
                console.log("Error");      
              });
          }
          else{
          this.projectService.search(searchTerms).subscribe(
            result =>{
              this.projects = result
            }, error =>{
              console.log("Error");      
            });
          }
        break
        case "profile":
          this.users = null
          if(searchForm.searchTerm == "" || !searchForm.searchTerm){
            this.accountService.getUserList().subscribe(
              result =>{
                this.users = result
              }, error =>{
                console.log("Error");      
              });
          }
          else{
          this.accountService.search(searchTerms).subscribe(
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
