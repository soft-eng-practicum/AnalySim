import { BlobFile } from 'src/app/interfaces/blob-file';
import { ProjectTag } from 'src/app/interfaces/project-tag';
import { ProjectUser } from './project-user';
import { Notebook } from './notebook';

export interface Project {
    projectID: number;
    name: string;
    visibility: string;
    description: string;
    dateCreated: Date;
    lastUpdated: Date;
    route: string;
    notebooks: Array<Notebook>;
    projectUsers: Array<ProjectUser>;
    blobFiles: Array<BlobFile>;
    projectTags: Array<ProjectTag>
    forkedFromProjectID: number;
}