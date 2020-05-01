import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ExploreProjectDetailComponent } from './explore-project-detail.component';

describe('ExploreProjectDetailComponent', () => {
  let component: ExploreProjectDetailComponent;
  let fixture: ComponentFixture<ExploreProjectDetailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ExploreProjectDetailComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExploreProjectDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
