import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ProjectsRoutingModule } from './projects-routing.module';
import { ProjectCreateComponent } from './project-create/project-create.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ProjectUploadFilesComponent } from './project-upload-files/project-upload-files.component';
import { ProjectTagComponent } from './project-list-tags/project-tag/project-tag.component';
import { ProjectUserComponent } from './project-list-users/project-user/project-user.component';
import { ProjectFormCreateComponent } from './project-create/project-form-create/project-form-create.component';
import { ProjectFormUsersComponent } from './project-create/project-form-users/project-form-users.component';
import { ProjectFormTagsComponent } from './project-create/project-form-tags/project-form-tags.component';
import { ProjectListTagsComponent} from './project-list-tags/project-list-tags.component';
import { ProjectListUsersComponent} from './project-list-users/project-list-users.component';
import { ApplicationPipesModule } from '../application-pipes/application-pipes.module';


@NgModule({
  declarations: [
    ProjectCreateComponent,
    ProjectUploadFilesComponent,
    ProjectTagComponent,
    ProjectUserComponent,
    ProjectFormCreateComponent,
    ProjectFormUsersComponent,
    ProjectFormTagsComponent,
    ProjectListTagsComponent,
    ProjectListUsersComponent,
  ],
  imports: [
    CommonModule,
    ProjectsRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    ApplicationPipesModule,
  ]
})
export class ProjectsModule { }
