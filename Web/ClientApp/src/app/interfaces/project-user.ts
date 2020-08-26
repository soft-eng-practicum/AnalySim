import { Project } from './project';
import { ApplicationUser } from './user';

export interface ProjectUser {
    projectID: number
    project : Project
    userID: number
    user : ApplicationUser
    userRole: string
    isFollowing: boolean
}