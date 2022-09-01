import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardFollowingComponent } from './dashboard-following.component';

describe('DashboardFollowingComponent', () => {
  let component: DashboardFollowingComponent;
  let fixture: ComponentFixture<DashboardFollowingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DashboardFollowingComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DashboardFollowingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
