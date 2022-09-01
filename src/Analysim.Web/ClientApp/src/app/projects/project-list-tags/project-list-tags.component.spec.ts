import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectListTagsComponent } from './project-list-tags.component';

describe('ProjectListTagsComponent', () => {
  let component: ProjectListTagsComponent;
  let fixture: ComponentFixture<ProjectListTagsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProjectListTagsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProjectListTagsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
