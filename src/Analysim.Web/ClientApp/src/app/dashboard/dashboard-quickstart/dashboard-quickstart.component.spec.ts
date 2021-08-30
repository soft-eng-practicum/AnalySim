import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardQuickstartComponent } from './dashboard-quickstart.component';

describe('DashboardQuickstartComponent', () => {
  let component: DashboardQuickstartComponent;
  let fixture: ComponentFixture<DashboardQuickstartComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DashboardQuickstartComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DashboardQuickstartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
