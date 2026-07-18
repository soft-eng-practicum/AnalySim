import { Component, OnInit, EventEmitter, Input, Output } from '@angular/core';
import { FormGroup, FormControl, Validators, FormBuilder, ValidatorFn, AbstractControl } from '@angular/forms';
import { ProjectService } from 'src/app/services/project.service';
import { Project } from 'src/app/interfaces/project';
import { AccountService } from 'src/app/services/account.service';
import { User } from 'src/app/interfaces/user';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { ProjectUser } from 'src/app/interfaces/project-user';


@Component({
  selector: 'app-project-form-edit',
  templateUrl: './project-form-edit.component.html',
  styleUrls: ['./project-form-edit.component.scss']
})
export class ProjectFormEditComponent implements OnInit {

  constructor(
    private projectService: ProjectService,
    private accountService: AccountService,
    private formBuilder: FormBuilder,
    private router: Router) { }


  // Form Control - Edit Project
  projectForm: FormGroup
  name: FormControl
  description: FormControl
  visibility: FormControl

  currentUser$: Observable<User>
  currentUser: User
  isLoading: boolean
  submitErrorMessage: string

  currentProject$: Observable<Project> = null
  project: Project
  projectUser: ProjectUser = null


  @Input() owner: string
  @Input() projectname: string
  @Output() setProject = new EventEmitter<Project>()

  async ngOnInit() {
    if (!this.accountService.checkLoginStatus()) {
      this.router.navigate(['/login'], { queryParams: { returnUrl: this.router.url } })
      return;
    }

    this.isLoading = false;
    this.submitErrorMessage = '';

    await this.accountService.currentUser.then((x) => this.currentUser$ = x)
    this.currentUser$.subscribe(x => this.currentUser = x)

    // Initialize Form Controls
    this.name = new FormControl('', [Validators.required, Validators.minLength(5), Validators.maxLength(20), this.noSpaceSpecial()])
    this.description = new FormControl('')
    this.visibility = new FormControl('', [Validators.required])

    // Initialize FormGroup using FormBuilder
    this.projectForm = this.formBuilder.group({
      name: this.name,
      description: this.description,
      visibility: this.visibility
    })

    if (!this.owner || !this.projectname) {
      this.submitErrorMessage = 'Project route is missing.';
      return;
    }

    this.loadProject(this.owner, this.projectname);
  }

  loadProject(owner: string, projectname: string) {
    this.isLoading = true;
    this.submitErrorMessage = '';

    this.projectService.getProjectByRoute(owner, projectname).subscribe(
      result => {
        this.project = result;
        this.projectForm.patchValue({
          name: result.name,
          description: result.description,
          visibility: result.visibility
        });
        this.setProject.emit(result);
        this.isLoading = false;
      }, error => {
        this.isLoading = false;
        this.submitErrorMessage = error?.error?.message || 'Failed to load project.';
        console.log(error);
      }
    );
  }


  // Custom Validator
  noSpaceSpecial(): ValidatorFn {
    return (projectNameControl: AbstractControl): { [key: string]: boolean } | null => {

      // Check if empty
      if (projectNameControl.value.length == '') {
        return null
      }

      // Regular Expression for having Space or Special Character
      var reg = new RegExp('^[a-zA-Z0-9\-]*$');

      // Return Error Message if test false, otherwise return null
      if (!reg.test(projectNameControl.value)) {
        return { 'noSpaceSpecial': true }
      }
      else {
        return null
      }
    }
  }


  onSubmit() {
    if (!this.project || this.projectForm.invalid) {
      this.projectForm.markAllAsTouched();
      return;
    }

    //setting the values of the project form
    let projectForm = this.projectForm.value;
    this.submitErrorMessage = '';
    this.isLoading = true;


    this.project.description = projectForm.description;
    this.project.name = projectForm.name;
    this.project.visibility = projectForm.visibility;

    //updates project based on those parameters
    this.projectService.updateProject(this.project).subscribe(
      result => {
        this.isLoading = false;
        this.setProject.emit(result);

        const [owner, projectname] = result.route.split('/');
        this.router.navigate(['/project', owner, projectname]);
      }, error => {
        this.isLoading = false;
        this.submitErrorMessage = error?.error?.message || 'Failed to update project.';
        console.log(error)
      }
    )




  }

}
