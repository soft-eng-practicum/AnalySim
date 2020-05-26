import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectListUsersComponent } from './project-list-users.component';

describe('ProjectListUsersComponent', () => {
  let component: ProjectListUsersComponent;
  let fixture: ComponentFixture<ProjectListUsersComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProjectListUsersComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProjectListUsersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
