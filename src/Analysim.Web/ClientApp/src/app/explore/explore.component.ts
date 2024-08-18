import { Component, OnInit } from '@angular/core';
import { ProjectService } from '../services/project.service';
import { Project } from '../interfaces/project';
import { FormGroup, FormControl, FormBuilder } from '@angular/forms';
import { AccountService } from '../services/account.service';
import { User } from '../interfaces/user';
import { ActivatedRoute, Router } from '@angular/router';
import { JsonPipe } from '@angular/common';
import { HttpParams } from '@angular/common/http';
import { ExploreService } from '../services/explore.service';

@Component({
  selector: 'app-explore',
  templateUrl: './explore.component.html',
  styleUrls: ['./explore.component.scss']
})
export class ExploreComponent implements OnInit {

  constructor(
    private projectService : ProjectService,
    private accountService : AccountService,
    private formBuilder : FormBuilder,
    public exploreService : ExploreService,
    private route : ActivatedRoute,
    private router: Router) { }

  // Form Control - Create Project
  searchForm : FormGroup
  searchCategory : FormControl
  searchTerm : FormControl
  termParam : string[]
  categoryParam : string

  projects : Project[]
  users : User[]

  ngOnInit(): void {
    this.projects = null
    this.users = null

    // get return url from route parameters or default to '/'
    this.termParam = JSON.parse(this.route.snapshot.queryParams['term'] || '[]')
    this.categoryParam = this.route.snapshot.queryParams['category'] || '[]'


    let searchTermString = ""
    this.termParam.forEach(x => searchTermString += x + " ")

    switch(this.categoryParam){
      case "project":
        this.exploreService.exploreProject(searchTermString)
        break;
      case "profile":
        this.searchProfile(this.termParam)
        break;
      default:
        this.categoryParam = "project"
        this.router.navigate(['/explore'], { queryParams: { category : 'project', term : JSON.stringify(this.termParam)}})
        this.exploreService.exploreProject('')
        break;
    }

    // Initialize Form Controls
    this.searchCategory = new FormControl(this.categoryParam);
    this.searchTerm = new FormControl(searchTermString);

    // Initialize FormGroup using FormBuilder
    this.searchForm = this.formBuilder.group({
        searchCategory : this.searchCategory,
        searchTerm : this.searchTerm
    });

    this.searchCategory.valueChanges.subscribe(val =>{
      this.searchForm.value.searchCategory = val
      this.onSubmit()
    })
  }

  searchProfile(searchTerms : string[]){
    this.users = null
    if(searchTerms.length == 0){
      this.accountService.getUserList().subscribe(
        result =>{
          this.users = result
        }, error =>{
          console.log(error);      
        });
    }
    else{
    this.accountService.search(searchTerms).subscribe(
      result =>{
        this.users = result
      }, error =>{
        console.log(error);      
      });
    }
  }

  onSubmit(){

    let searchForm = this.searchForm.value

    let searchTerms : string[] = Array.from(new Set(searchForm.searchTerm.split(" ").filter(x => x.length != 0)))

    console.log(searchForm.searchCategory)

    switch(searchForm.searchCategory)
    {
        case "project":
          this.exploreService.exploreProject(searchForm.searchTerm)
        break
        case "profile":
          this.searchProfile(searchTerms)
          this.router.navigate(['/explore'], { queryParams: { category : 'profile', term : JSON.stringify(searchTerms)}})
        break
    }
  }

}
