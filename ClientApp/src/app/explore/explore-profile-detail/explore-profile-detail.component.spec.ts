import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ExploreProfileDetailComponent } from './explore-profile-detail.component';

describe('ExploreProfileDetailComponent', () => {
  let component: ExploreProfileDetailComponent;
  let fixture: ComponentFixture<ExploreProfileDetailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ExploreProfileDetailComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExploreProfileDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
