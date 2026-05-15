import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectLogItemComponent } from './project-log-item.component';

describe('ProjectLogItemComponent', () => {
  let component: ProjectLogItemComponent;
  let fixture: ComponentFixture<ProjectLogItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProjectLogItemComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProjectLogItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
