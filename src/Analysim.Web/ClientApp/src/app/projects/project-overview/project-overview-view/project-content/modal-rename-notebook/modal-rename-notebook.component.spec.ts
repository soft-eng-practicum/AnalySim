import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalRenameNotebookComponent } from './modal-rename-notebook.component';

describe('ModalRenameNotebookComponent', () => {
  let component: ModalRenameNotebookComponent;
  let fixture: ComponentFixture<ModalRenameNotebookComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ModalRenameNotebookComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModalRenameNotebookComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
