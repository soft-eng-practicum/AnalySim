import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectFormCreateComponent } from './project-form-create.component';

describe('ProjectFormCreateComponent', () => {
  let component: ProjectFormCreateComponent;
  let fixture: ComponentFixture<ProjectFormCreateComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProjectFormCreateComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProjectFormCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
