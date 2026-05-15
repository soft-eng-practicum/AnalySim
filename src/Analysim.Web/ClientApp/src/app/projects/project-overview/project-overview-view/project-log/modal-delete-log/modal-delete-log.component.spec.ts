import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalDeleteLogComponent } from './modal-delete-log.component';

describe('ModalDeleteLogComponent', () => {
  let component: ModalDeleteLogComponent;
  let fixture: ComponentFixture<ModalDeleteLogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ModalDeleteLogComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModalDeleteLogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
