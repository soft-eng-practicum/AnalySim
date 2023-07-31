import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalNotebookFolderComponent } from './modal-notebook-folder.component';

describe('ModalNotebookFolderComponent', () => {
  let component: ModalNotebookFolderComponent;
  let fixture: ComponentFixture<ModalNotebookFolderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ModalNotebookFolderComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModalNotebookFolderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
