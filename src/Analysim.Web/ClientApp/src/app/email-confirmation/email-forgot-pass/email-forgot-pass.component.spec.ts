import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EmailForgotPassComponent } from './email-forgot-pass.component';

describe('EmailForgotPassComponent', () => {
  let component: EmailForgotPassComponent;
  let fixture: ComponentFixture<EmailForgotPassComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EmailForgotPassComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EmailForgotPassComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
