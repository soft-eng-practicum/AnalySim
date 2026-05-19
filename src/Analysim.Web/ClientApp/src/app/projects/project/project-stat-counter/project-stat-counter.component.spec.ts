import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectStatCounterComponent } from './project-stat-counter.component';

describe('ProjectStatCounterComponent', () => {
  let component: ProjectStatCounterComponent;
  let fixture: ComponentFixture<ProjectStatCounterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProjectStatCounterComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProjectStatCounterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
