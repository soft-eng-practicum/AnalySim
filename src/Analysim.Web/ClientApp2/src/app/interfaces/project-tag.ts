import { Tag } from 'src/app/interfaces/tag';
import { Project } from 'src/app/interfaces/project';

export interface ProjectTag {
    tagID: number;
    tag: Tag;
    projectID: number;
    project: Project;
}