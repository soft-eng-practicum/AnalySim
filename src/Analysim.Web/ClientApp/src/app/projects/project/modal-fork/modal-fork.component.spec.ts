import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalForkComponent } from './modal-fork.component';

describe('ModalForkComponent', () => {
  let component: ModalForkComponent;
  let fixture: ComponentFixture<ModalForkComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ModalForkComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModalForkComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
