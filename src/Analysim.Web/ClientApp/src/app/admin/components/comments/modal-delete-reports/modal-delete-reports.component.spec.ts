import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalDeleteReportsComponent } from './modal-delete-reports.component';

describe('ModalDeleteReportsComponent', () => {
  let component: ModalDeleteReportsComponent;
  let fixture: ComponentFixture<ModalDeleteReportsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ModalDeleteReportsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModalDeleteReportsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
