import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ExploreProjectListComponent } from './explore-project-list.component';

describe('ExploreProjectListComponent', () => {
  let component: ExploreProjectListComponent;
  let fixture: ComponentFixture<ExploreProjectListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ExploreProjectListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExploreProjectListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
