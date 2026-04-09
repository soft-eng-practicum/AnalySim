import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalReportCommentComponent } from './modal-report-comment.component';

describe('ModalReportCommentComponent', () => {
  let component: ModalReportCommentComponent;
  let fixture: ComponentFixture<ModalReportCommentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ModalReportCommentComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModalReportCommentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
