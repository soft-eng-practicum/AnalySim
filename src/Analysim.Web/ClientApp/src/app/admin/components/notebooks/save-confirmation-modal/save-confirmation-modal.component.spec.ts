import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SaveConfirmationModalComponent } from './save-confirmation-modal.component';

describe('SaveConfirmationModalComponent', () => {
  let component: SaveConfirmationModalComponent;
  let fixture: ComponentFixture<SaveConfirmationModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SaveConfirmationModalComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SaveConfirmationModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
