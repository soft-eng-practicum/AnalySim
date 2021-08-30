import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalUploadItemComponent } from './modal-upload-item.component';

describe('ModalUploadItemComponent', () => {
  let component: ModalUploadItemComponent;
  let fixture: ComponentFixture<ModalUploadItemComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ModalUploadItemComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalUploadItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
