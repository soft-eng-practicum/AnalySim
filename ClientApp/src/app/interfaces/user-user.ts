import { ApplicationUser } from './user';

export interface UserUser {
    userID: number;
    user : ApplicationUser
    followerID: number;
    follower : ApplicationUser
}