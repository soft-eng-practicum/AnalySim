import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectFormUsersComponent } from './project-form-users.component';

describe('ProjectFormUsersComponent', () => {
  let component: ProjectFormUsersComponent;
  let fixture: ComponentFixture<ProjectFormUsersComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProjectFormUsersComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProjectFormUsersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
