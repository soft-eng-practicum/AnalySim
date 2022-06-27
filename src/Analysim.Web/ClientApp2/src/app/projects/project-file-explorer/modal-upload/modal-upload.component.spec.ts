import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalUploadComponent } from './modal-upload.component';

describe('ModalUploadComponent', () => {
  let component: ModalUploadComponent;
  let fixture: ComponentFixture<ModalUploadComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ModalUploadComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModalUploadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
