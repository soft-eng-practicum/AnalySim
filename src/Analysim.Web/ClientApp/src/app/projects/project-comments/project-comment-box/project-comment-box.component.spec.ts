import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectCommentBoxComponent } from './project-comment-box.component';

describe('ProjectCommentBoxComponent', () => {
  let component: ProjectCommentBoxComponent;
  let fixture: ComponentFixture<ProjectCommentBoxComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProjectCommentBoxComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProjectCommentBoxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
