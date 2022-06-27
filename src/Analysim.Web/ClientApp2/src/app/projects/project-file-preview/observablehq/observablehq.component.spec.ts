import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ObservablehqComponent } from './observablehq.component';

describe('ObservablehqComponent', () => {
  let component: ObservablehqComponent;
  let fixture: ComponentFixture<ObservablehqComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ObservablehqComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ObservablehqComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
