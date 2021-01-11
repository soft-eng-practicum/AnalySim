import { Project } from './project';
import { User } from './user';

export interface ProjectUser {
    projectID: number
    project : Project
    userID: number
    user : User
    userRole: string
    isFollowing: boolean
}