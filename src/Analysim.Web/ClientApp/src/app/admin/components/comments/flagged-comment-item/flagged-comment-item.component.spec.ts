import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FlaggedCommentItemComponent } from './flagged-comment-item.component';

describe('FlaggedCommentItemComponent', () => {
  let component: FlaggedCommentItemComponent;
  let fixture: ComponentFixture<FlaggedCommentItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FlaggedCommentItemComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FlaggedCommentItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
