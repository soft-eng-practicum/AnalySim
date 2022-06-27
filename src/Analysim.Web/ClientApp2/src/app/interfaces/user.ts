import { BlobFile } from 'src/app/interfaces/blob-file';
import { ProjectUser } from './project-user';
import { UserUser } from './user-user';

export interface User {
    id: number
    userName: string
    email: string
    bio: string
    dateCreated: Date
    lastOnline: Date
    followers: Array<UserUser>
    following : Array<UserUser>
    projectUsers : Array<ProjectUser>
    blobFiles : Array<BlobFile>
}