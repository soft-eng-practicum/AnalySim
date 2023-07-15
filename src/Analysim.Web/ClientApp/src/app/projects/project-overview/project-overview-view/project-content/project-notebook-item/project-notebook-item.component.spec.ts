import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectNotebookItemComponent } from './project-notebook-item.component';

describe('ProjectNotebookItemComponent', () => {
  let component: ProjectNotebookItemComponent;
  let fixture: ComponentFixture<ProjectNotebookItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProjectNotebookItemComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProjectNotebookItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
