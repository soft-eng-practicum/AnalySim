export interface ProjectMemberPermissions {
    membersCanEditProject: boolean;
    membersCanManageMembers: boolean;
    membersCanManageTags: boolean;
    membersCanUploadFiles: boolean;
    membersCanManageFiles: boolean;
    membersCanUploadNotebooks: boolean;
    membersCanManageNotebooks: boolean;
    membersCanManagePublications: boolean;
    membersCanManageProjectLogs: boolean;
}

export interface ProjectMemberPermissionOption {
    key: keyof ProjectMemberPermissions;
    label: string;
    description: string;
}

export const PROJECT_MEMBER_PERMISSION_OPTIONS: ProjectMemberPermissionOption[] = [
    {
        key: 'membersCanEditProject',
        label: 'Edit project details',
        description: 'Change the project name, description, and visibility.'
    },
    {
        key: 'membersCanManageMembers',
        label: 'Manage members',
        description: 'Invite or remove members and handle join requests.'
    },
    {
        key: 'membersCanManageTags',
        label: 'Manage tags',
        description: 'Add and remove project tags.'
    },
    {
        key: 'membersCanUploadFiles',
        label: 'Upload files',
        description: 'Upload datasets and create dataset folders.'
    },
    {
        key: 'membersCanManageFiles',
        label: 'Manage files',
        description: 'Rename, move, and delete project files.'
    },
    {
        key: 'membersCanUploadNotebooks',
        label: 'Upload notebooks',
        description: 'Upload notebooks, versions, and create notebook folders.'
    },
    {
        key: 'membersCanManageNotebooks',
        label: 'Manage notebooks',
        description: 'Rename or delete notebooks and manage their datasets.'
    },
    {
        key: 'membersCanManagePublications',
        label: 'Manage publications',
        description: 'Add, edit, and delete project publications.'
    },
    {
        key: 'membersCanManageProjectLogs',
        label: 'Manage project logs',
        description: 'Create, edit, delete, and repost project logs.'
    }
];

export function createDefaultProjectMemberPermissions(): ProjectMemberPermissions {
    return {
        membersCanEditProject: false,
        membersCanManageMembers: false,
        membersCanManageTags: false,
        membersCanUploadFiles: true,
        membersCanManageFiles: false,
        membersCanUploadNotebooks: true,
        membersCanManageNotebooks: false,
        membersCanManagePublications: true,
        membersCanManageProjectLogs: true
    };
}
