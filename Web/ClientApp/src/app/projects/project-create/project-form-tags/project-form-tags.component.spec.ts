import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectFormTagsComponent } from './project-form-tags.component';

describe('ProjectFormTagsComponent', () => {
  let component: ProjectFormTagsComponent;
  let fixture: ComponentFixture<ProjectFormTagsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProjectFormTagsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProjectFormTagsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
