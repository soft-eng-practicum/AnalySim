import { BlobFile } from '@data/types/blob-file';
import { ProjectUser } from '@data/types/project-user';
import { UserUser } from '@data/types/user-user';

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
