import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectHomeComponent } from './project-home.component';

describe('ProjectHomeComponent', () => {
  let component: ProjectHomeComponent;
  let fixture: ComponentFixture<ProjectHomeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProjectHomeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProjectHomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
