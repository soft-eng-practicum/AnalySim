import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectUploadModalItemComponent } from './project-upload-modal-item.component';

describe('ProjectUploadModalItemComponent', () => {
  let component: ProjectUploadModalItemComponent;
  let fixture: ComponentFixture<ProjectUploadModalItemComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProjectUploadModalItemComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProjectUploadModalItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
