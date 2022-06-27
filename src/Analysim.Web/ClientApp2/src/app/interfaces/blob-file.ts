import { User } from './user';
import { Project } from './project';

export interface BlobFile {
    blobFileID: number
    container: string
    directory: string
    name: string
    extension: string
    size: number
    uri: string
    dateCreated: Date
    lastModified: Date
    user : User
    userID : number
    project : Project
    projectID : number
}