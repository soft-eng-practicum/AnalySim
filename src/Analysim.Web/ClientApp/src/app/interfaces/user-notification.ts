export interface UserNotification {
  notificationID: number;
  type: string;
  actorUserID?: number;
  projectID?: number;
  commentID?: number;
  projectLogID?: number;
  title: string;
  body: string;
  link?: string;
  dataJson?: string;
  isRead: boolean;
  readAt?: Date;
  createdAt: Date;
}

export interface UserNotificationPage {
  result: UserNotification[];
  total: number;
  page: number;
  pageSize: number;
  message: string;
}

export interface UserNotificationPreference {
  notificationType: string;
  inAppEnabled: boolean;
  emailEnabled: boolean;
}

export const UserNotificationTypes = {
  CommentReply: 'comment.reply',
  ProjectMemberAdded: 'project.member.added',
  ProjectJoined: 'project.joined',
  ProjectLogCreated: 'project.log.created',
  ProjectLogUpdated: 'project.log.updated',
};
