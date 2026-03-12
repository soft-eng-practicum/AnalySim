import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectDisplayComponent } from './project-display.component';

describe('ProjectDisplayComponent', () => {
  let component: ProjectDisplayComponent;
  let fixture: ComponentFixture<ProjectDisplayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProjectDisplayComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProjectDisplayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
