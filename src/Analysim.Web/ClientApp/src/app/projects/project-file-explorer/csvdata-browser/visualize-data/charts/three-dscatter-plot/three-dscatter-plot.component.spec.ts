import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ThreeDScatterPlotComponent } from './three-dscatter-plot.component';

describe('ThreeDScatterPlotComponent', () => {
  let component: ThreeDScatterPlotComponent;
  let fixture: ComponentFixture<ThreeDScatterPlotComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ThreeDScatterPlotComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ThreeDScatterPlotComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
