import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardSocialComponent } from './dashboard-social.component';

describe('DashboardSocialComponent', () => {
  let component: DashboardSocialComponent;
  let fixture: ComponentFixture<DashboardSocialComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DashboardSocialComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DashboardSocialComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
