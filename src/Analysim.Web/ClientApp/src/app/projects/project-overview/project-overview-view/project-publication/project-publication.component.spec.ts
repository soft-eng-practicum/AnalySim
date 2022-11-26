import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectPublicationComponent } from './project-publication.component';

describe('ProjectPublicationComponent', () => {
  let component: ProjectPublicationComponent;
  let fixture: ComponentFixture<ProjectPublicationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProjectPublicationComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProjectPublicationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
