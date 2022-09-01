import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectFileExplorerItemComponent } from './project-file-explorer-item.component';

describe('ProjectFileExplorerItemComponent', () => {
  let component: ProjectFileExplorerItemComponent;
  let fixture: ComponentFixture<ProjectFileExplorerItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProjectFileExplorerItemComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProjectFileExplorerItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
