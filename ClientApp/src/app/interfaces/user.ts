import { BlobFile } from 'src/app/interfaces/blob-file';
import { ProjectUser } from './project-user';
import { UserUser } from './user-user';

export interface ApplicationUser {
    id: number;
    userName: string;
    email: string;
    bio: string;
    followers: Array<UserUser>;
    follwing : Array<UserUser>;
    projectUsers : Array<ProjectUser>
    blobFiles : Array<BlobFile>
}