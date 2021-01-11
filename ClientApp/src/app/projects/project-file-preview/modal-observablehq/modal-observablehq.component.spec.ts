import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalObservablehqComponent } from './modal-observablehq.component';

describe('ModalObservablehqComponent', () => {
  let component: ModalObservablehqComponent;
  let fixture: ComponentFixture<ModalObservablehqComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ModalObservablehqComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalObservablehqComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
