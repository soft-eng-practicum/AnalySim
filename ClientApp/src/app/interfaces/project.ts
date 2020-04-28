import { BlobFile } from 'src/app/interfaces/blob-file';
import { ApplicationUserProject } from 'src/app/interfaces/application-user-project';

export interface Project {
    projectID?: number;
    name: string;
    visibility: string;
    description: string;
    dateCreated: Date;
    lastUpdated: number;
    route: string;
    applicationUserProjects: Array<ApplicationUserProject>;
    blobFiles : Array<BlobFile>;
}