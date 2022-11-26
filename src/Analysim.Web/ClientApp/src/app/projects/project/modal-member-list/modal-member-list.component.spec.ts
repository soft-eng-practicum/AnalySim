import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalMemberListComponent } from './modal-member-list.component';

describe('ModalMemberListComponent', () => {
  let component: ModalMemberListComponent;
  let fixture: ComponentFixture<ModalMemberListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ModalMemberListComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModalMemberListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
