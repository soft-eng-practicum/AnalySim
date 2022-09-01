import { Tag } from '@data/types/tag';
import { Project } from '@data/types/project';

export interface ProjectTag {
    tagID: number;
    tag: Tag;
    projectID: number;
    project: Project;
}
