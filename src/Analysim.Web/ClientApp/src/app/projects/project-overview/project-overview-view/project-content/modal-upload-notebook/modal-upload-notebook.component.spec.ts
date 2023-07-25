import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalUploadNotebookComponent } from './modal-upload-notebook.component';

describe('ModalUploadNotebookComponent', () => {
  let component: ModalUploadNotebookComponent;
  let fixture: ComponentFixture<ModalUploadNotebookComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ModalUploadNotebookComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModalUploadNotebookComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
