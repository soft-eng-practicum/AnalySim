import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectFilePreviewComponent } from './project-file-preview.component';

describe('ProjectFilePreviewComponent', () => {
  let component: ProjectFilePreviewComponent;
  let fixture: ComponentFixture<ProjectFilePreviewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProjectFilePreviewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProjectFilePreviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
