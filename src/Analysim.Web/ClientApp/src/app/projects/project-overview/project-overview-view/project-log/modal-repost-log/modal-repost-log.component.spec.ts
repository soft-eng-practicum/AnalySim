import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalRepostLogComponent } from './modal-repost-log.component';

describe('ModalRepostLogComponent', () => {
  let component: ModalRepostLogComponent;
  let fixture: ComponentFixture<ModalRepostLogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ModalRepostLogComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModalRepostLogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
