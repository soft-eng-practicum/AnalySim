import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalRestoreLogComponent } from './modal-restore-log.component';

describe('ModalRestoreLogComponent', () => {
  let component: ModalRestoreLogComponent;
  let fixture: ComponentFixture<ModalRestoreLogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ModalRestoreLogComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModalRestoreLogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
