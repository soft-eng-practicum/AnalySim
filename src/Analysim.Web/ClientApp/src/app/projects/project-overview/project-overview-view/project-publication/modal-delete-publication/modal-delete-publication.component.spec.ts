import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalDeletePublicationComponent } from './modal-delete-publication.component';

describe('ModalDeletePublicationComponent', () => {
  let component: ModalDeletePublicationComponent;
  let fixture: ComponentFixture<ModalDeletePublicationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ModalDeletePublicationComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModalDeletePublicationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
