import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalDatasetsComponent } from './modal-datasets.component';

describe('ModalDatasetsComponent', () => {
  let component: ModalDatasetsComponent;
  let fixture: ComponentFixture<ModalDatasetsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ModalDatasetsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModalDatasetsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
