import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectLogsComponent } from './project-logs.component';

describe('ProjectLogsComponent', () => {
  let component: ProjectLogsComponent;
  let fixture: ComponentFixture<ProjectLogsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProjectLogsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProjectLogsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
