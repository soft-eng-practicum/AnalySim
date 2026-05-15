import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExpiredLogItemComponent } from './expired-log-item.component';

describe('ExpiredLogItemComponent', () => {
  let component: ExpiredLogItemComponent;
  let fixture: ComponentFixture<ExpiredLogItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ExpiredLogItemComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExpiredLogItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
