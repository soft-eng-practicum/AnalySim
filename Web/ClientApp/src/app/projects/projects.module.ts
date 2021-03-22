import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ProjectsRoutingModule } from './projects-routing.module';
import { ProjectCreateComponent } from './project-create/project-create.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ProjectTagComponent } from './project-list-tags/project-tag/project-tag.component';
import { ProjectUserComponent } from './project-list-users/project-user/project-user.component';
import { ProjectFormCreateComponent } from './project-create/project-form-create/project-form-create.component';
import { ProjectFormUsersComponent } from './project-create/project-form-users/project-form-users.component';
import { ProjectFormTagsComponent } from './project-create/project-form-tags/project-form-tags.component';
import { ProjectListTagsComponent} from './project-list-tags/project-list-tags.component';
import { ProjectListUsersComponent} from './project-list-users/project-list-users.component';
import { ApplicationPipesModule } from '../application-pipes/application-pipes.module';
import { ProjectComponent } from './project/project.component';
import { ProjectFileExplorerComponent } from './project-file-explorer/project-file-explorer.component';
import { ProjectFileExplorerItemComponent } from './project-file-explorer/project-file-explorer-item/project-file-explorer-item.component';
import { ModalFolderComponent } from './project-file-explorer/modal-folder/modal-folder.component';
import { ModalUploadComponent } from './project-file-explorer/modal-upload/modal-upload.component';
import { ModalEditComponent } from './project-file-explorer/modal-edit/modal-edit.component';

import { ModalUploadItemComponent } from './project-file-explorer/modal-upload/modal-upload-item/modal-upload-item.component';
import { ProjectFilePreviewComponent } from './project-file-preview/project-file-preview.component';
import { ObservablehqComponent } from './project-file-preview/observablehq/observablehq.component';
import { ModalObservablehqComponent } from './project-file-preview/modal-observablehq/modal-observablehq.component';
import { MemberListComponent } from './member-list/member-list.component';


@NgModule({
  declarations: [
    ProjectCreateComponent,
    ProjectTagComponent,
    ProjectUserComponent,
    ProjectFormCreateComponent,
    ProjectFormUsersComponent,
    ProjectFormTagsComponent,
    ProjectListTagsComponent,
    ProjectListUsersComponent,
    ProjectComponent,
    ProjectFileExplorerComponent,
    ProjectFileExplorerItemComponent,
    ModalFolderComponent,
    ModalUploadComponent,
    ModalEditComponent,
    ModalUploadItemComponent,
    ProjectFilePreviewComponent,
    ObservablehqComponent,
    ModalObservablehqComponent,
    MemberListComponent,
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
