import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalIgnoreReportsComponent } from './modal-ignore-reports.component';

describe('ModalIgnoreReportsComponent', () => {
  let component: ModalIgnoreReportsComponent;
  let fixture: ComponentFixture<ModalIgnoreReportsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ModalIgnoreReportsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModalIgnoreReportsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
