import { BlobFile } from 'src/app/interfaces/blob-file';
import { ProjectTag } from 'src/app/interfaces/project-tag';
import { ApplicationUserProject } from 'src/app/interfaces/application-user-project';

export interface Project {
    projectID: number;
    name: string;
    visibility: string;
    description: string;
    dateCreated: Date;
    lastUpdated: Date;
    route: string;
    applicationUserProjects: Array<ApplicationUserProject>;
    blobFiles : Array<BlobFile>;
    projectTags : Array<ProjectTag>
}