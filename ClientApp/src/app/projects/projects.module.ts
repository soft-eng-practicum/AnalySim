import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ProjectsRoutingModule } from './projects-routing.module';
import { ProjectCreateComponent } from './project-create/project-create.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ProjectUploadFilesComponent } from './project-upload-files/project-upload-files.component';
import { ProjectMemberComponent } from './project-member/project-member.component';


@NgModule({
  declarations: [
    ProjectCreateComponent,
    ProjectUploadFilesComponent,
    ProjectMemberComponent,
  ],
  imports: [
    CommonModule,
    ProjectsRoutingModule,
    FormsModule,
    ReactiveFormsModule
  ]
})
export class ProjectsModule { }
