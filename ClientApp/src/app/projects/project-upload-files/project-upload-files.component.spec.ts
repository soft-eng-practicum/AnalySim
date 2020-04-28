import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectUploadFilesComponent } from './project-upload-files.component';

describe('ProjectUploadFilesComponent', () => {
  let component: ProjectUploadFilesComponent;
  let fixture: ComponentFixture<ProjectUploadFilesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProjectUploadFilesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProjectUploadFilesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
