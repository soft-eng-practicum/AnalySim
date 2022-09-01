import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalUploadItemComponent } from './modal-upload-item.component';

describe('ModalUploadItemComponent', () => {
  let component: ModalUploadItemComponent;
  let fixture: ComponentFixture<ModalUploadItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ModalUploadItemComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModalUploadItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
