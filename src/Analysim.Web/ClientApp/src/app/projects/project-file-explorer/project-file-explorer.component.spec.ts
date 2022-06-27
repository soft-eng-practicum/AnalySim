import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectFileExplorerComponent } from './project-file-explorer.component';

describe('ProjectFileExplorerComponent', () => {
  let component: ProjectFileExplorerComponent;
  let fixture: ComponentFixture<ProjectFileExplorerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProjectFileExplorerComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProjectFileExplorerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
