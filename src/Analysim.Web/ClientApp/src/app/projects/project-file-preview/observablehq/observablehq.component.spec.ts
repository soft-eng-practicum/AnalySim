import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ObservablehqComponent } from './observablehq.component';

describe('ObservablehqComponent', () => {
  let component: ObservablehqComponent;
  let fixture: ComponentFixture<ObservablehqComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ObservablehqComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ObservablehqComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
