import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectNotebookItemDisplayComponent } from './project-notebook-item-display.component';

describe('ProjectNotebookItemDisplayComponent', () => {
  let component: ProjectNotebookItemDisplayComponent;
  let fixture: ComponentFixture<ProjectNotebookItemDisplayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProjectNotebookItemDisplayComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProjectNotebookItemDisplayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
