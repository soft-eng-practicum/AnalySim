import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalDeleteCommentComponent } from './modal-delete-comment.component';

describe('ModalDeleteCommentComponent', () => {
  let component: ModalDeleteCommentComponent;
  let fixture: ComponentFixture<ModalDeleteCommentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ModalDeleteCommentComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModalDeleteCommentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
