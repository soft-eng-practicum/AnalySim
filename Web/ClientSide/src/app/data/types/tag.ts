import { ProjectTag } from '@data/types/project-tag';

export interface Tag {
    tagID: number;
    name: string;
    projectTags: Array<ProjectTag>;
}
