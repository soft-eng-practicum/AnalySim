import { ProjectTag } from 'src/app/interfaces/project-tag';

export interface Tag {
    tagID?: number;
    name: string;
    projectTags: Array<ProjectTag>;
}