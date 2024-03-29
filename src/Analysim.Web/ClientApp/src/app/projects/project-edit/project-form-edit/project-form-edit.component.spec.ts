import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectFormEditComponent } from './project-form-edit.component';

describe('ProjectFormEditComponent', () => {
  let component: ProjectFormEditComponent;
  let fixture: ComponentFixture<ProjectFormEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProjectFormEditComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProjectFormEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
