import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EmailResendVerificationComponent } from './email-resend-verification.component';

describe('EmailResendVerificationComponent', () => {
  let component: EmailResendVerificationComponent;
  let fixture: ComponentFixture<EmailResendVerificationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EmailResendVerificationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EmailResendVerificationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
