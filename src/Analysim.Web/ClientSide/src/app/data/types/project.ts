import { BlobFile } from '@data/types/blob-file';
import { ProjectTag } from '@data/types/project-tag';
import { ProjectUser } from '@data/types/project-user';

export interface Project {
    projectID: number;
    name: string;
    visibility: string;
    description: string;
    dateCreated: Date;
    lastUpdated: Date;
    route: string;
    projectUsers: Array<ProjectUser>;
    blobFiles : Array<BlobFile>;
    projectTags : Array<ProjectTag>
}
