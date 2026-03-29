import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectCommentItemComponent } from './project-comment-item.component';

describe('ProjectCommentItemComponent', () => {
  let component: ProjectCommentItemComponent;
  let fixture: ComponentFixture<ProjectCommentItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProjectCommentItemComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProjectCommentItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
