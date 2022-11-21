import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectLogComponent } from './project-log.component';

describe('ProjectLogComponent', () => {
  let component: ProjectLogComponent;
  let fixture: ComponentFixture<ProjectLogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProjectLogComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProjectLogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
