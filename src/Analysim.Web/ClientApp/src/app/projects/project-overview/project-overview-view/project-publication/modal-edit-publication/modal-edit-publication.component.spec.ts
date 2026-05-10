import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalEditPublicationComponent } from './modal-edit-publication.component';

describe('ModalEditPublicationComponent', () => {
  let component: ModalEditPublicationComponent;
  let fixture: ComponentFixture<ModalEditPublicationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ModalEditPublicationComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModalEditPublicationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
