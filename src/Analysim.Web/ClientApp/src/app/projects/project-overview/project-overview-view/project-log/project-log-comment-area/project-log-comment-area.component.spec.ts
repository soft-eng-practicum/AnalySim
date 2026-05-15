import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectLogCommentAreaComponent } from './project-log-comment-area.component';

describe('ProjectLogCommentAreaComponent', () => {
  let component: ProjectLogCommentAreaComponent;
  let fixture: ComponentFixture<ProjectLogCommentAreaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProjectLogCommentAreaComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProjectLogCommentAreaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
