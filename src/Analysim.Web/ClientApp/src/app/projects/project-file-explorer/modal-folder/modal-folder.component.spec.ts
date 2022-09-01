import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalFolderComponent } from './modal-folder.component';

describe('ModalFolderComponent', () => {
  let component: ModalFolderComponent;
  let fixture: ComponentFixture<ModalFolderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ModalFolderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalFolderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
