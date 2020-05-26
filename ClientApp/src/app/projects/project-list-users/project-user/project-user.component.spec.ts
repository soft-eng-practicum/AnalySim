import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectUserComponent } from './project-user.component';

describe('ProjectUserComponent', () => {
  let component: ProjectUserComponent;
  let fixture: ComponentFixture<ProjectUserComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProjectUserComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProjectUserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
