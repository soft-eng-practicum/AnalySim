import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ProjectsRoutingModule } from './projects-routing.module';
import { ProjectCreateComponent } from './project-create/project-create.component';
import { ProjectEditComponent } from './project-edit/project-edit.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ProjectTagComponent } from './project-list-tags/project-tag/project-tag.component';
import { ProjectUserComponent } from './project-list-users/project-user/project-user.component';
import { ProjectFormCreateComponent } from './project-create/project-form-create/project-form-create.component';
import { ProjectFormEditComponent } from './project-edit/project-form-edit/project-form-edit.component';
import { ProjectFormUsersComponent } from './project-create/project-form-users/project-form-users.component';
import { ProjectFormTagsComponent } from './project-create/project-form-tags/project-form-tags.component';
import { ProjectListTagsComponent } from './project-list-tags/project-list-tags.component';
import { ProjectListUsersComponent } from './project-list-users/project-list-users.component';
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
import { ModalForkComponent } from './project/modal-fork/modal-fork.component';
import { ModalDeleteComponent } from './project/modal-delete/modal-delete.component';
import { ProjectContentComponent } from './project-overview/project-overview-view/project-content/project-content.component';
import { ProjectPublicationComponent } from './project-overview/project-overview-view/project-publication/project-publication.component';
import { ModalMemberListComponent } from './project/modal-member-list/modal-member-list.component';
import { ProjectLogComponent } from './project-overview/project-overview-view/project-log/project-log.component';
import { ModalUploadNotebookComponent } from './project-overview/project-overview-view/project-content/modal-upload-notebook/modal-upload-notebook.component';
import { ProjectNotebookItemComponent } from './project-overview/project-overview-view/project-content/project-notebook-item/project-notebook-item.component';
import { ProjectNotebookItemDisplayComponent } from './project-overview/project-overview-view/project-content/project-notebook-item/project-notebook-item-display/project-notebook-item-display.component';
import { ModalNotebookFolderComponent } from './project-overview/project-overview-view/project-content/modal-notebook-folder/modal-notebook-folder.component';
import { ProjectCommentsComponent } from './project-comments/project-comments.component';
import { ModalRenameNotebookComponent } from './project-overview/project-overview-view/project-content/modal-rename-notebook/modal-rename-notebook.component';
import { CSVDataBrowserComponent } from './project-file-explorer/csvdata-browser/csvdata-browser.component';
import { TableModule } from 'primeng/table';


@NgModule({
  declarations: [
    ProjectCreateComponent,
    ProjectTagComponent,
    ProjectUserComponent,
    ProjectEditComponent,
    ProjectFormCreateComponent,
    ProjectFormUsersComponent,
    ProjectFormTagsComponent,
    ProjectFormEditComponent,
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
    ModalForkComponent,
    ModalDeleteComponent,
    ProjectContentComponent,
    ProjectPublicationComponent,
    ModalMemberListComponent,
    ProjectLogComponent,
    ModalUploadNotebookComponent,
    ProjectNotebookItemComponent,
    ProjectNotebookItemDisplayComponent,
    ModalNotebookFolderComponent,
    ProjectCommentsComponent
    ModalRenameNotebookComponent,
    CSVDataBrowserComponent
  ],
  imports: [
    CommonModule,
    ProjectsRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    ApplicationPipesModule,
    TableModule
  ]
})
export class ProjectsModule { }
