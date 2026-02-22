export interface AppNotification {
    id: number;
    userId: number;
    title: string;
    message: string;
    type: 'ProjectInvitation' | 'NewFollower' | 'SecurityAlert';
    isRead: boolean;
    linkUrl: string;
    createdAt: Date;
}
