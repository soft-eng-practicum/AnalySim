import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { Project } from 'src/app/interfaces/project';
import { ProjectRecommendation } from 'src/app/interfaces/project-recommendation';
import { User } from 'src/app/interfaces/user';
import { ProjectService } from 'src/app/services/project.service';

@Component({
  selector: 'app-modal-recommend',
  templateUrl: './modal-recommend.component.html',
  styleUrls: ['./modal-recommend.component.scss']
})
export class ModalRecommendComponent implements OnInit {
  constructor(private projectService: ProjectService) { }

  @Input() recommendModalRef: BsModalRef;
  @Input() project: Project;
  @Input() currentUser: User;
  @Input() recommendation: ProjectRecommendation;
  @Input() isOwner: boolean;
  @Input() allowAction: boolean = true;

  @Output() recommendationSaved = new EventEmitter<ProjectRecommendation>();
  @Output() recommendationRemoved = new EventEmitter<ProjectRecommendation>();

  comment: string = '';
  recommendations: ProjectRecommendation[] = [];
  isLoading: boolean = false;
  errorResult: string = '';
  errorStatusAlert: boolean = false;

  ngOnInit(): void {
    this.comment = this.recommendation?.comment || '';
    this.loadRecommendations();
  }

  get canEditRecommendation(): boolean {
    return this.allowAction && !this.isOwner;
  }

  closeModal() {
    this.recommendModalRef.hide();
  }

  saveRecommendation() {
    if (!this.canEditRecommendation) return;

    const comment = this.comment.trim();
    if (!comment) {
      this.handleError('Recommendation comment is required.');
      return;
    }

    this.isLoading = true;
    this.errorStatusAlert = false;

    const request = this.recommendation
      ? this.projectService.updateRecommendation(this.recommendation.projectRecommendationID, comment)
      : this.projectService.recommendProject(this.project.projectID, comment);

    request.subscribe(result => {
      this.recommendationSaved.emit(result);
      this.upsertRecommendation(result);
      this.isLoading = false;
      this.closeModal();
    }, error => {
      console.log(error);
      this.handleError(error?.error?.message || 'Unable to save recommendation.');
    });
  }

  removeRecommendation() {
    if (!this.canEditRecommendation) return;
    if (!this.recommendation) return;

    this.isLoading = true;
    this.errorStatusAlert = false;

    this.projectService.unrecommendProject(this.project.projectID).subscribe(result => {
      this.recommendationRemoved.emit(result);
      this.recommendations = this.recommendations.filter(x => x.projectRecommendationID != result.projectRecommendationID);
      this.isLoading = false;
      this.closeModal();
    }, error => {
      console.log(error);
      this.handleError(error?.error?.message || 'Unable to remove recommendation.');
    });
  }

  handleError(text: string) {
    this.errorResult = text;
    this.errorStatusAlert = true;
    this.isLoading = false;
  }

  loadRecommendations() {
    this.projectService.getProjectRecommendations(this.project.projectID).subscribe(result => {
      this.recommendations = result;
    }, error => {
      console.log(error);
    });
  }

  upsertRecommendation(recommendation: ProjectRecommendation) {
    let index = this.recommendations.findIndex(x => x.projectRecommendationID == recommendation.projectRecommendationID);
    if (index > -1) {
      this.recommendations[index] = recommendation;
    } else {
      this.recommendations.unshift(recommendation);
    }
  }
}
