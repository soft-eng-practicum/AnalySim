import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectListUsersComponent } from './project-list-users.component';

describe('ProjectListUsersComponent', () => {
  let component: ProjectListUsersComponent;
  let fixture: ComponentFixture<ProjectListUsersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProjectListUsersComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProjectListUsersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
