import { Project } from './project';
import { User } from './user';

export interface ProjectMembershipRequest {
    projectMembershipRequestID: number
    projectID: number
    project: Project
    requesterUserID: number
    requesterUser: User
    targetUserID: number
    targetUser: User
    createdByUserID: number
    createdByUser: User
    type: string
    status: string
    message: string
    createdAt: Date
    respondedAt: Date
}
