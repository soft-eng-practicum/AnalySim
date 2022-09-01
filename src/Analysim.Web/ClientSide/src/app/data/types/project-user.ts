import { Project } from '@data/types/project';
import { User } from '@data/types/user';

export interface ProjectUser {
    projectID: number
    project : Project
    userID: number
    user : User
    userRole: string
    isFollowing: boolean
}
